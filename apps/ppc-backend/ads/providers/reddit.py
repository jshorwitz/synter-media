from typing import List, Optional
from urllib.parse import urlencode
import httpx
import logging

from .base import (
    IProvider,
    ProviderCapability,
    TokenBundle,
    OAuthAppCredentials,
    CampaignInfo,
    MutateResult
)

logger = logging.getLogger(__name__)


class RedditAdsProvider(IProvider):
    """Reddit Ads API provider implementation."""
    
    OAUTH_AUTHORIZE_URL = "https://www.reddit.com/api/v1/authorize"
    OAUTH_TOKEN_URL = "https://www.reddit.com/api/v1/access_token"
    API_BASE_URL = "https://ads-api.reddit.com/api/v2.0"
    
    @property
    def platform_name(self) -> str:
        return "reddit_ads"
    
    @property
    def capabilities(self) -> List[ProviderCapability]:
        return [
            ProviderCapability.BUDGETS,
            ProviderCapability.PAUSE_CAMPAIGN,
            ProviderCapability.PAUSE_AD,
            ProviderCapability.AUDIENCE_TARGETING,
        ]
    
    def get_authorize_url(
        self,
        app_cred: OAuthAppCredentials,
        state: str,
        pkce_challenge: Optional[str] = None
    ) -> str:
        params = {
            "client_id": app_cred.client_id,
            "response_type": "code",
            "state": state,
            "redirect_uri": app_cred.redirect_uri,
            "duration": "permanent",
            "scope": " ".join(app_cred.scopes or ["ads.read", "ads.write"]),
        }
        
        return f"{self.OAUTH_AUTHORIZE_URL}?{urlencode(params)}"
    
    async def exchange_code_for_tokens(
        self,
        app_cred: OAuthAppCredentials,
        code: str,
        pkce_verifier: Optional[str] = None
    ) -> TokenBundle:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": app_cred.redirect_uri,
        }
        
        auth = (app_cred.client_id, app_cred.client_secret)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.OAUTH_TOKEN_URL,
                data=data,
                auth=auth,
                headers={"User-Agent": "Synter-PPC/1.0"}
            )
            response.raise_for_status()
            token_data = response.json()
        
        return TokenBundle(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            token_type=token_data.get("token_type", "Bearer"),
            expires_in=token_data.get("expires_in", 3600),
            scope=token_data.get("scope"),
        )
    
    async def refresh_tokens(
        self,
        app_cred: OAuthAppCredentials,
        refresh_token: str
    ) -> TokenBundle:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
        }
        
        auth = (app_cred.client_id, app_cred.client_secret)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.OAUTH_TOKEN_URL,
                data=data,
                auth=auth,
                headers={"User-Agent": "Synter-PPC/1.0"}
            )
            response.raise_for_status()
            token_data = response.json()
        
        return TokenBundle(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token", refresh_token),
            token_type=token_data.get("token_type", "Bearer"),
            expires_in=token_data.get("expires_in", 3600),
            scope=token_data.get("scope"),
        )
    
    async def revoke_token(
        self,
        app_cred: OAuthAppCredentials,
        token: str
    ) -> bool:
        data = {
            "token": token,
            "token_type_hint": "access_token"
        }
        
        auth = (app_cred.client_id, app_cred.client_secret)
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://www.reddit.com/api/v1/revoke_token",
                data=data,
                auth=auth,
                headers={"User-Agent": "Synter-PPC/1.0"}
            )
            return response.status_code == 204
    
    async def list_campaigns(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> List[CampaignInfo]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "Synter-PPC/1.0"
        }
        
        url = f"{self.API_BASE_URL}/accounts/{account_id}/campaigns"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()
        
        campaigns = []
        for campaign_data in data.get("data", []):
            campaigns.append(CampaignInfo(
                id=campaign_data["id"],
                name=campaign_data["name"],
                status=campaign_data.get("status", "UNKNOWN"),
                daily_budget_micros=int(campaign_data.get("daily_budget", 0) * 1_000_000),
                currency_code=campaign_data.get("currency", "USD"),
                platform="reddit_ads",
                metadata={"campaign_type": campaign_data.get("campaign_type")}
            ))
        
        return campaigns
    
    async def update_campaign_budget(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        new_budget_micros: int,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "Synter-PPC/1.0",
            "Content-Type": "application/json"
        }
        
        budget_dollars = new_budget_micros / 1_000_000
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[f"campaigns/{campaign_id}"],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "new_budget": budget_dollars}
            )
        
        url = f"{self.API_BASE_URL}/accounts/{account_id}/campaigns/{campaign_id}"
        payload = {
            "daily_budget": budget_dollars
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[f"campaigns/{campaign_id}"],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"Reddit Ads update_campaign_budget failed: {ex}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[str(ex)],
                validate_only=False,
            )
    
    async def pause_campaign(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "Synter-PPC/1.0",
            "Content-Type": "application/json"
        }
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[f"campaigns/{campaign_id}"],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        url = f"{self.API_BASE_URL}/accounts/{account_id}/campaigns/{campaign_id}"
        payload = {
            "status": "PAUSED"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[f"campaigns/{campaign_id}"],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"Reddit Ads pause_campaign failed: {ex}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[str(ex)],
                validate_only=False,
            )
    
    async def pause_ad(
        self,
        access_token: str,
        account_id: str,
        ad_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "Synter-PPC/1.0",
            "Content-Type": "application/json"
        }
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[f"ads/{ad_id}"],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        url = f"{self.API_BASE_URL}/accounts/{account_id}/ads/{ad_id}"
        payload = {
            "status": "PAUSED"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.patch(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[f"ads/{ad_id}"],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"Reddit Ads pause_ad failed: {ex}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[str(ex)],
                validate_only=False,
            )
