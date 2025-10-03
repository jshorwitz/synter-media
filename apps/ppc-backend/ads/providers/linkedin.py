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


class LinkedInAdsProvider(IProvider):
    """LinkedIn Ads (Marketing Developer Platform) provider implementation."""
    
    OAUTH_AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
    OAUTH_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    API_BASE_URL = "https://api.linkedin.com/rest"
    
    @property
    def platform_name(self) -> str:
        return "linkedin_ads"
    
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
            "response_type": "code",
            "client_id": app_cred.client_id,
            "redirect_uri": app_cred.redirect_uri,
            "state": state,
            "scope": " ".join(app_cred.scopes or ["r_ads", "r_ads_reporting", "rw_ads"]),
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
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
            "redirect_uri": app_cred.redirect_uri,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.OAUTH_TOKEN_URL,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            token_data = response.json()
        
        return TokenBundle(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token"),
            token_type=token_data.get("token_type", "Bearer"),
            expires_in=token_data["expires_in"],
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
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.OAUTH_TOKEN_URL,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            token_data = response.json()
        
        return TokenBundle(
            access_token=token_data["access_token"],
            refresh_token=token_data.get("refresh_token", refresh_token),
            token_type=token_data.get("token_type", "Bearer"),
            expires_in=token_data["expires_in"],
            scope=token_data.get("scope"),
        )
    
    async def revoke_token(
        self,
        app_cred: OAuthAppCredentials,
        token: str
    ) -> bool:
        logger.warning("LinkedIn does not provide a standard token revocation endpoint")
        return False
    
    async def list_campaigns(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> List[CampaignInfo]:
        headers = {
            "Authorization": f"Bearer {access_token}",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        url = f"{self.API_BASE_URL}/adCampaignsV2"
        params = {
            "q": "search",
            "search.account.values[0]": f"urn:li:sponsoredAccount:{account_id}"
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                data = response.json()
            
            campaigns = []
            for element in data.get("elements", []):
                daily_budget = element.get("dailyBudget", {})
                amount_micros = int(daily_budget.get("amount", 0) * 1_000_000)
                
                campaigns.append(CampaignInfo(
                    id=element["id"],
                    name=element.get("name", "Unnamed"),
                    status=element.get("status", "UNKNOWN"),
                    daily_budget_micros=amount_micros,
                    currency_code=daily_budget.get("currencyCode", "USD"),
                    platform="linkedin_ads",
                    metadata={"campaign_group": element.get("campaignGroup")}
                ))
            
            return campaigns
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"LinkedIn Ads list_campaigns failed: {ex}")
            raise
    
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
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        
        budget_dollars = new_budget_micros / 1_000_000
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "new_budget": budget_dollars}
            )
        
        url = f"{self.API_BASE_URL}/adCampaignsV2/{campaign_id}"
        payload = {
            "patch": {
                "$set": {
                    "dailyBudget": {
                        "amount": str(budget_dollars)
                    }
                }
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"LinkedIn Ads update_campaign_budget failed: {ex}")
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
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        url = f"{self.API_BASE_URL}/adCampaignsV2/{campaign_id}"
        payload = {
            "patch": {
                "$set": {
                    "status": "PAUSED"
                }
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"LinkedIn Ads pause_campaign failed: {ex}")
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
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json"
        }
        
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[ad_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        url = f"{self.API_BASE_URL}/adCreativesV2/{ad_id}"
        payload = {
            "patch": {
                "$set": {
                    "status": "PAUSED"
                }
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
            
            return MutateResult(
                success=True,
                resource_names=[ad_id],
                error_messages=[],
                validate_only=False,
                provider_response=result
            )
            
        except httpx.HTTPStatusError as ex:
            logger.error(f"LinkedIn Ads pause_ad failed: {ex}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[str(ex)],
                validate_only=False,
            )
