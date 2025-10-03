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


class MicrosoftAdsProvider(IProvider):
    """Microsoft Advertising (Bing Ads) provider implementation."""
    
    OAUTH_AUTHORIZE_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    OAUTH_TOKEN_URL = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    
    @property
    def platform_name(self) -> str:
        return "microsoft_ads"
    
    @property
    def capabilities(self) -> List[ProviderCapability]:
        return [
            ProviderCapability.KEYWORDS,
            ProviderCapability.BUDGETS,
            ProviderCapability.PAUSE_CAMPAIGN,
            ProviderCapability.PAUSE_AD,
            ProviderCapability.NEGATIVE_KEYWORDS,
            ProviderCapability.BID_ADJUSTMENTS,
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
            "redirect_uri": app_cred.redirect_uri,
            "scope": " ".join(app_cred.scopes or ["https://ads.microsoft.com/ads.manage", "offline_access"]),
            "state": state,
            "response_mode": "query",
        }
        
        if pkce_challenge:
            params["code_challenge"] = pkce_challenge
            params["code_challenge_method"] = "S256"
        
        return f"{self.OAUTH_AUTHORIZE_URL}?{urlencode(params)}"
    
    async def exchange_code_for_tokens(
        self,
        app_cred: OAuthAppCredentials,
        code: str,
        pkce_verifier: Optional[str] = None
    ) -> TokenBundle:
        data = {
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
            "code": code,
            "redirect_uri": app_cred.redirect_uri,
            "grant_type": "authorization_code",
        }
        
        if pkce_verifier:
            data["code_verifier"] = pkce_verifier
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.OAUTH_TOKEN_URL, data=data)
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
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.OAUTH_TOKEN_URL, data=data)
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
        logger.warning("Microsoft Ads does not support token revocation via API")
        return False
    
    async def list_campaigns(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> List[CampaignInfo]:
        logger.info("Microsoft Ads list_campaigns - using SDK would be implemented here")
        return []
    
    async def update_campaign_budget(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        new_budget_micros: int,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "new_budget_micros": new_budget_micros}
            )
        
        logger.info(f"Microsoft Ads update_campaign_budget - SDK implementation needed")
        return MutateResult(
            success=False,
            resource_names=[],
            error_messages=["Not yet implemented - requires bingads SDK integration"],
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
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[campaign_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        logger.info(f"Microsoft Ads pause_campaign - SDK implementation needed")
        return MutateResult(
            success=False,
            resource_names=[],
            error_messages=["Not yet implemented - requires bingads SDK integration"],
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
        if validate_only:
            return MutateResult(
                success=True,
                resource_names=[ad_id],
                error_messages=[],
                validate_only=True,
                provider_response={"simulated": True, "action": "pause"}
            )
        
        logger.info(f"Microsoft Ads pause_ad - SDK implementation needed")
        return MutateResult(
            success=False,
            resource_names=[],
            error_messages=["Not yet implemented - requires bingads SDK integration"],
            validate_only=False,
        )
