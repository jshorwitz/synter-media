from .base import IProvider, ProviderCapability, TokenBundle, OAuthAppCredentials, CampaignInfo, MutateResult
from .google import GoogleAdsProvider
from .microsoft import MicrosoftAdsProvider
from .linkedin import LinkedInAdsProvider
from .reddit import RedditAdsProvider

__all__ = [
    "IProvider",
    "ProviderCapability",
    "TokenBundle",
    "OAuthAppCredentials",
    "CampaignInfo",
    "MutateResult",
    "GoogleAdsProvider",
    "MicrosoftAdsProvider",
    "LinkedInAdsProvider",
    "RedditAdsProvider",
    "ProviderManager",
]


class ProviderManager:
    """Registry and dispatcher for ad platform providers."""
    
    _providers = {
        "google_ads": GoogleAdsProvider(),
        "microsoft_ads": MicrosoftAdsProvider(),
        "linkedin_ads": LinkedInAdsProvider(),
        "reddit_ads": RedditAdsProvider(),
    }
    
    @classmethod
    def get_provider(cls, platform: str) -> IProvider:
        """Get provider instance by platform name."""
        provider = cls._providers.get(platform)
        if not provider:
            raise ValueError(f"Unknown platform: {platform}")
        return provider
    
    @classmethod
    def list_platforms(cls) -> list:
        """List all available platform names."""
        return list(cls._providers.keys())
    
    @classmethod
    def get_capabilities(cls, platform: str) -> list:
        """Get capabilities for a specific platform."""
        provider = cls.get_provider(platform)
        return [cap.value for cap in provider.capabilities]
