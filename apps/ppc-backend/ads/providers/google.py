from typing import List, Optional
from urllib.parse import urlencode
import httpx
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
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


class GoogleAdsProvider(IProvider):
    """Google Ads API provider implementation."""
    
    OAUTH_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
    OAUTH_REVOKE_URL = "https://oauth2.googleapis.com/revoke"
    OAUTH_SCOPE = "https://www.googleapis.com/auth/adwords"
    
    @property
    def platform_name(self) -> str:
        return "google_ads"
    
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
            "redirect_uri": app_cred.redirect_uri,
            "response_type": "code",
            "scope": self.OAUTH_SCOPE,
            "access_type": "offline",
            "prompt": "consent",
            "state": state,
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
            "grant_type": "authorization_code",
            "redirect_uri": app_cred.redirect_uri,
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
            refresh_token=refresh_token,
            token_type=token_data.get("token_type", "Bearer"),
            expires_in=token_data["expires_in"],
            scope=token_data.get("scope"),
        )
    
    async def revoke_token(
        self,
        app_cred: OAuthAppCredentials,
        token: str
    ) -> bool:
        params = {"token": token}
        
        async with httpx.AsyncClient() as client:
            response = await client.post(self.OAUTH_REVOKE_URL, params=params)
            return response.status_code == 200
    
    def _build_client(
        self,
        access_token: str,
        app_cred: OAuthAppCredentials
    ) -> GoogleAdsClient:
        """Build Google Ads client with credentials."""
        credentials = {
            "developer_token": app_cred.developer_token,
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
            "refresh_token": access_token,
            "use_proto_plus": True,
        }
        
        if app_cred.login_customer_id:
            credentials["login_customer_id"] = app_cred.login_customer_id
        
        return GoogleAdsClient.load_from_dict(credentials)
    
    async def list_campaigns(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> List[CampaignInfo]:
        if not app_cred:
            raise ValueError("app_cred required for Google Ads")
        
        client = self._build_client(access_token, app_cred)
        ga_service = client.get_service("GoogleAdsService")
        
        query = """
            SELECT
                campaign.id,
                campaign.name,
                campaign.status,
                campaign_budget.amount_micros,
                customer.currency_code
            FROM campaign
            WHERE campaign.status != 'REMOVED'
        """
        
        customer_id = account_id.replace("-", "")
        
        try:
            response = ga_service.search(customer_id=customer_id, query=query)
            
            campaigns = []
            for row in response:
                campaigns.append(CampaignInfo(
                    id=str(row.campaign.id),
                    name=row.campaign.name,
                    status=row.campaign.status.name,
                    daily_budget_micros=row.campaign_budget.amount_micros,
                    currency_code=row.customer.currency_code,
                    platform="google_ads",
                ))
            
            return campaigns
            
        except GoogleAdsException as ex:
            logger.error(f"Google Ads list_campaigns failed: {ex}")
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
        if not app_cred:
            raise ValueError("app_cred required for Google Ads")
        
        client = self._build_client(access_token, app_cred)
        customer_id = account_id.replace("-", "")
        
        budget_service = client.get_service("CampaignBudgetService")
        campaign_service = client.get_service("CampaignService")
        
        query = f"""
            SELECT campaign.campaign_budget
            FROM campaign
            WHERE campaign.id = {campaign_id}
        """
        
        ga_service = client.get_service("GoogleAdsService")
        response = ga_service.search(customer_id=customer_id, query=query)
        
        budget_resource_name = None
        for row in response:
            budget_resource_name = row.campaign.campaign_budget
            break
        
        if not budget_resource_name:
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[f"Campaign {campaign_id} not found"],
                validate_only=validate_only,
            )
        
        budget_operation = client.get_type("CampaignBudgetOperation")
        budget = budget_operation.update
        budget.resource_name = budget_resource_name
        budget.amount_micros = new_budget_micros
        
        field_mask = client.get_type("FieldMask")
        field_mask.paths.append("amount_micros")
        budget_operation.update_mask.CopyFrom(field_mask)
        
        try:
            with client.configure().operation_settings(validate_only=validate_only):
                response = budget_service.mutate_campaign_budgets(
                    customer_id=customer_id,
                    operations=[budget_operation]
                )
            
            return MutateResult(
                success=True,
                resource_names=[r.resource_name for r in response.results],
                error_messages=[],
                validate_only=validate_only,
            )
            
        except GoogleAdsException as ex:
            error_messages = [error.message for error in ex.failure.errors]
            logger.error(f"Google Ads update_campaign_budget failed: {error_messages}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=error_messages,
                validate_only=validate_only,
            )
    
    async def pause_campaign(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        if not app_cred:
            raise ValueError("app_cred required for Google Ads")
        
        client = self._build_client(access_token, app_cred)
        customer_id = account_id.replace("-", "")
        campaign_service = client.get_service("CampaignService")
        
        campaign_operation = client.get_type("CampaignOperation")
        campaign = campaign_operation.update
        campaign.resource_name = campaign_service.campaign_path(customer_id, campaign_id)
        campaign.status = client.enums.CampaignStatusEnum.PAUSED
        
        field_mask = client.get_type("FieldMask")
        field_mask.paths.append("status")
        campaign_operation.update_mask.CopyFrom(field_mask)
        
        try:
            with client.configure().operation_settings(validate_only=validate_only):
                response = campaign_service.mutate_campaigns(
                    customer_id=customer_id,
                    operations=[campaign_operation]
                )
            
            return MutateResult(
                success=True,
                resource_names=[r.resource_name for r in response.results],
                error_messages=[],
                validate_only=validate_only,
            )
            
        except GoogleAdsException as ex:
            error_messages = [error.message for error in ex.failure.errors]
            logger.error(f"Google Ads pause_campaign failed: {error_messages}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=error_messages,
                validate_only=validate_only,
            )
    
    async def pause_ad(
        self,
        access_token: str,
        account_id: str,
        ad_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        if not app_cred:
            raise ValueError("app_cred required for Google Ads")
        
        client = self._build_client(access_token, app_cred)
        customer_id = account_id.replace("-", "")
        ad_group_service = client.get_service("AdGroupService")
        
        ad_group_operation = client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.update
        ad_group.resource_name = ad_group_service.ad_group_path(customer_id, ad_id)
        ad_group.status = client.enums.AdGroupStatusEnum.PAUSED
        
        field_mask = client.get_type("FieldMask")
        field_mask.paths.append("status")
        ad_group_operation.update_mask.CopyFrom(field_mask)
        
        try:
            with client.configure().operation_settings(validate_only=validate_only):
                response = ad_group_service.mutate_ad_groups(
                    customer_id=customer_id,
                    operations=[ad_group_operation]
                )
            
            return MutateResult(
                success=True,
                resource_names=[r.resource_name for r in response.results],
                error_messages=[],
                validate_only=validate_only,
            )
            
        except GoogleAdsException as ex:
            error_messages = [error.message for error in ex.failure.errors]
            logger.error(f"Google Ads pause_ad failed: {error_messages}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=error_messages,
                validate_only=validate_only,
            )
    
    async def add_negative_keyword(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        keyword_text: str,
        match_type: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        if not app_cred:
            raise ValueError("app_cred required for Google Ads")
        
        client = self._build_client(access_token, app_cred)
        customer_id = account_id.replace("-", "")
        campaign_criterion_service = client.get_service("CampaignCriterionService")
        
        campaign_criterion_operation = client.get_type("CampaignCriterionOperation")
        criterion = campaign_criterion_operation.create
        criterion.campaign = campaign_criterion_service.campaign_path(customer_id, campaign_id)
        criterion.negative = True
        criterion.keyword.text = keyword_text
        
        match_type_enum = client.enums.KeywordMatchTypeEnum
        if match_type.upper() == "EXACT":
            criterion.keyword.match_type = match_type_enum.EXACT
        elif match_type.upper() == "PHRASE":
            criterion.keyword.match_type = match_type_enum.PHRASE
        elif match_type.upper() == "BROAD":
            criterion.keyword.match_type = match_type_enum.BROAD
        else:
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=[f"Invalid match type: {match_type}"],
                validate_only=validate_only,
            )
        
        try:
            with client.configure().operation_settings(validate_only=validate_only):
                response = campaign_criterion_service.mutate_campaign_criteria(
                    customer_id=customer_id,
                    operations=[campaign_criterion_operation]
                )
            
            return MutateResult(
                success=True,
                resource_names=[r.resource_name for r in response.results],
                error_messages=[],
                validate_only=validate_only,
            )
            
        except GoogleAdsException as ex:
            error_messages = [error.message for error in ex.failure.errors]
            logger.error(f"Google Ads add_negative_keyword failed: {error_messages}")
            return MutateResult(
                success=False,
                resource_names=[],
                error_messages=error_messages,
                validate_only=validate_only,
            )
