from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ProviderCapability(str, Enum):
    KEYWORDS = "keywords"
    BUDGETS = "budgets"
    PAUSE_CAMPAIGN = "pause_campaign"
    PAUSE_AD = "pause_ad"
    NEGATIVE_KEYWORDS = "negative_keywords"
    BID_ADJUSTMENTS = "bid_adjustments"
    AUDIENCE_TARGETING = "audience_targeting"


@dataclass
class TokenBundle:
    """OAuth token response from provider."""
    access_token: str
    refresh_token: Optional[str]
    token_type: str
    expires_in: int
    scope: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class OAuthAppCredentials:
    """OAuth application credentials."""
    client_id: str
    client_secret=REDACTED
    redirect_uri: str
    scopes: List[str]
    developer_token: Optional[str] = None
    login_customer_id: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class CampaignInfo:
    """Normalized campaign information across providers."""
    id: str
    name: str
    status: str
    daily_budget_micros: Optional[int]
    currency_code: str
    platform: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class MutateResult:
    """Result of a mutate operation."""
    success: bool
    resource_names: List[str]
    error_messages: List[str]
    validate_only: bool
    provider_response: Optional[Dict[str, Any]] = None


class IProvider(ABC):
    """Base interface for ad platform providers."""
    
    @property
    @abstractmethod
    def platform_name(self) -> str:
        """Return the platform identifier (e.g., 'google_ads')."""
        pass
    
    @property
    @abstractmethod
    def capabilities(self) -> List[ProviderCapability]:
        """Return list of supported capabilities for this provider."""
        pass
    
    @abstractmethod
    def get_authorize_url(
        self,
        app_cred: OAuthAppCredentials,
        state: str,
        pkce_challenge: Optional[str] = None
    ) -> str:
        """
        Generate OAuth authorization URL.
        
        Args:
            app_cred: OAuth application credentials
            state: CSRF state parameter
            pkce_challenge: Optional PKCE code challenge
            
        Returns:
            Authorization URL to redirect user to
        """
        pass
    
    @abstractmethod
    async def exchange_code_for_tokens(
        self,
        app_cred: OAuthAppCredentials,
        code: str,
        pkce_verifier: Optional[str] = None
    ) -> TokenBundle:
        """
        Exchange authorization code for access and refresh tokens.
        
        Args:
            app_cred: OAuth application credentials
            code: Authorization code from provider
            pkce_verifier: Optional PKCE code verifier
            
        Returns:
            TokenBundle with access and refresh tokens
        """
        pass
    
    @abstractmethod
    async def refresh_tokens(
        self,
        app_cred: OAuthAppCredentials,
        refresh_token: str
    ) -> TokenBundle:
        """
        Refresh access token using refresh token.
        
        Args:
            app_cred: OAuth application credentials
            refresh_token: Refresh token
            
        Returns:
            TokenBundle with new access token
        """
        pass
    
    @abstractmethod
    async def revoke_token(
        self,
        app_cred: OAuthAppCredentials,
        token: str
    ) -> bool:
        """
        Revoke an access or refresh token.
        
        Args:
            app_cred: OAuth application credentials
            token: Token to revoke
            
        Returns:
            True if successfully revoked
        """
        pass
    
    @abstractmethod
    async def list_campaigns(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> List[CampaignInfo]:
        """
        List all campaigns for an account.
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            app_cred: Optional app credentials (for developer tokens, etc.)
            
        Returns:
            List of normalized campaign information
        """
        pass
    
    @abstractmethod
    async def update_campaign_budget(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        new_budget_micros: int,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        """
        Update campaign daily budget.
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            campaign_id: Campaign to update
            new_budget_micros: New budget in micros
            validate_only: If True, only validate (don't apply)
            app_cred: Optional app credentials
            
        Returns:
            MutateResult with operation status
        """
        pass
    
    @abstractmethod
    async def pause_campaign(
        self,
        access_token: str,
        account_id: str,
        campaign_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        """
        Pause a campaign.
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            campaign_id: Campaign to pause
            validate_only: If True, only validate (don't apply)
            app_cred: Optional app credentials
            
        Returns:
            MutateResult with operation status
        """
        pass
    
    @abstractmethod
    async def pause_ad(
        self,
        access_token: str,
        account_id: str,
        ad_id: str,
        validate_only: bool = True,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> MutateResult:
        """
        Pause an ad or ad group.
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            ad_id: Ad or ad group identifier
            validate_only: If True, only validate (don't apply)
            app_cred: Optional app credentials
            
        Returns:
            MutateResult with operation status
        """
        pass
    
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
        """
        Add negative keyword to campaign (only for keyword-capable platforms).
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            campaign_id: Campaign to add negative keyword to
            keyword_text: Keyword text
            match_type: Match type (EXACT, PHRASE, BROAD)
            validate_only: If True, only validate (don't apply)
            app_cred: Optional app credentials
            
        Returns:
            MutateResult with operation status
            
        Raises:
            NotImplementedError: If provider doesn't support keywords
        """
        raise NotImplementedError(f"{self.platform_name} does not support keyword management")
    
    async def health_check(
        self,
        access_token: str,
        account_id: str,
        app_cred: Optional[OAuthAppCredentials] = None
    ) -> bool:
        """
        Perform a health check to verify credentials and connectivity.
        
        Args:
            access_token: Valid access token
            account_id: Ad account identifier
            app_cred: Optional app credentials
            
        Returns:
            True if healthy, False otherwise
        """
        try:
            await self.list_campaigns(access_token, account_id, app_cred)
            return True
        except Exception:
            return False
