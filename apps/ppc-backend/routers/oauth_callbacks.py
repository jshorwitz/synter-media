from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import logging

from database import get_db
from models_vault import (
    Platform,
    OAuthAppCredential,
    AdAccountConnection,
    PlatformType,
    ConnectionStatus
)
from services.crypto_service import crypto_service
from services.token_service import TokenService
from ads.providers import ProviderManager, OAuthAppCredentials

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["oauth"])


async def _get_account_info(platform: str, access_token: str, app_cred: OAuthAppCredentials) -> dict:
    """
    Fetch account information from the provider API.
    
    Returns:
        dict with 'account_id', 'account_name', and optional platform-specific fields
    """
    provider = ProviderManager.get_provider(platform)
    
    if platform == "google_ads":
        from google.ads.googleads.client import GoogleAdsClient
        
        credentials = {
            "developer_token": app_cred.developer_token,
            "client_id": app_cred.client_id,
            "client_secret": app_cred.client_secret,
            "refresh_token": access_token,
            "use_proto_plus": True,
        }
        
        if app_cred.login_customer_id:
            credentials["login_customer_id"] = app_cred.login_customer_id
        
        client = GoogleAdsClient.load_from_dict(credentials)
        customer_service = client.get_service("CustomerService")
        
        accessible_customers = customer_service.list_accessible_customers()
        if accessible_customers.resource_names:
            customer_id = accessible_customers.resource_names[0].split('/')[-1]
            
            ga_service = client.get_service("GoogleAdsService")
            query = "SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1"
            response = ga_service.search(customer_id=customer_id, query=query)
            
            for row in response:
                return {
                    "account_id": str(row.customer.id),
                    "account_name": row.customer.descriptive_name or f"Account {row.customer.id}",
                    "manager_customer_id": app_cred.login_customer_id,
                }
        
        raise ValueError("No accessible Google Ads accounts found")
    
    elif platform == "reddit_ads":
        import httpx
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "Synter-PPC/1.0"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get("https://oauth.reddit.com/api/v1/me", headers=headers)
            response.raise_for_status()
            user_data = response.json()
            
            accounts_response = await client.get(
                "https://ads-api.reddit.com/api/v2.0/accounts",
                headers=headers
            )
            accounts_response.raise_for_status()
            accounts = accounts_response.json()
            
            if accounts.get("data") and len(accounts["data"]) > 0:
                account = accounts["data"][0]
                return {
                    "account_id": account["id"],
                    "account_name": account.get("name", f"Reddit Account {account['id']}"),
                }
            
            raise ValueError("No Reddit Ads accounts found")
    
    elif platform == "linkedin_ads":
        import httpx
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "LinkedIn-Version": "202401",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.linkedin.com/rest/adAccounts?q=search&search.type.values[0]=BUSINESS",
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("elements") and len(data["elements"]) > 0:
                account = data["elements"][0]
                account_id = account["id"]
                account_name = account.get("name", f"LinkedIn Account {account_id}")
                
                return {
                    "account_id": account_id,
                    "account_name": account_name,
                    "organization_id": account.get("reference"),
                }
            
            raise ValueError("No LinkedIn Ads accounts found")
    
    elif platform == "microsoft_ads":
        return {
            "account_id": "MANUAL_SETUP_REQUIRED",
            "account_name": "Microsoft Ads Account - Configure Manually",
            "tenant_id": None,
        }
    
    else:
        raise ValueError(f"Unsupported platform: {platform}")


@router.get("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str = Query(...),
    state: str = Query(...),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback for all platforms.
    
    This endpoint receives the authorization code from the OAuth provider,
    exchanges it for tokens, creates the connection, and stores the tokens.
    """
    
    if error:
        logger.error(f"OAuth error for {platform}: {error} - {error_description}")
        return HTMLResponse(
            content=f"""
            <html>
                <head><title>OAuth Error</title></head>
                <body style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1 style="color: #d32f2f;">OAuth Authorization Failed</h1>
                    <p><strong>Platform:</strong> {platform}</p>
                    <p><strong>Error:</strong> {error}</p>
                    <p><strong>Description:</strong> {error_description or 'No description provided'}</p>
                    <p><a href="/">Return to Home</a></p>
                </body>
            </html>
            """,
            status_code=400
        )
    
    try:
        platform_record = db.query(Platform).filter(
            Platform.name == PlatformType(platform)
        ).first()
        
        if not platform_record:
            raise HTTPException(404, f"Platform {platform} not found")
        
        app_cred_model = db.query(OAuthAppCredential).filter(
            OAuthAppCredential.platform_id == platform_record.id,
            OAuthAppCredential.is_active == True
        ).first()
        
        if not app_cred_model:
            raise HTTPException(404, f"No active OAuth app found for {platform}")
        
        app_cred = OAuthAppCredentials(
            client_id=app_cred_model.client_id,
            client_secret=REDACTED(app_cred_model.client_secret_ciphertext),
            redirect_uri=app_cred_model.redirect_uri,
            scopes=app_cred_model.scopes or [],
            developer_token=crypto_service.decrypt(app_cred_model.developer_token_ciphertext) if app_cred_model.developer_token_ciphertext else None,
            login_customer_id=app_cred_model.login_customer_id,
        )
        
        provider = ProviderManager.get_provider(platform)
        
        logger.info(f"Exchanging code for tokens - {platform}")
        token_bundle = await provider.exchange_code_for_tokens(app_cred, code)
        
        logger.info(f"Fetching account information - {platform}")
        account_info = await _get_account_info(platform, token_bundle.refresh_token or token_bundle.access_token, app_cred)
        
        existing_connection = db.query(AdAccountConnection).filter(
            AdAccountConnection.platform_id == platform_record.id,
            AdAccountConnection.external_account_id == account_info["account_id"]
        ).first()
        
        if existing_connection:
            logger.info(f"Updating existing connection {existing_connection.id}")
            existing_connection.status = ConnectionStatus.ACTIVE
            existing_connection.status_message = "Reconnected via OAuth"
            existing_connection.oauth_app_credentials_id = app_cred_model.id
            connection = existing_connection
        else:
            logger.info(f"Creating new connection for account {account_info['account_id']}")
            connection = AdAccountConnection(
                id=str(uuid.uuid4()),
                platform_id=platform_record.id,
                oauth_app_credentials_id=app_cred_model.id,
                external_account_id=account_info["account_id"],
                account_name=account_info["account_name"],
                tenant_id=account_info.get("tenant_id"),
                manager_customer_id=account_info.get("manager_customer_id"),
                organization_id=account_info.get("organization_id"),
                status=ConnectionStatus.ACTIVE,
                connected_by="oauth_user",
            )
            db.add(connection)
        
        db.flush()
        
        logger.info(f"Storing tokens for connection {connection.id}")
        await TokenService.store_new_tokens(db, connection.id, token_bundle)
        
        db.commit()
        
        logger.info(f"✅ Successfully connected {platform} account {account_info['account_id']}")
        
        return HTMLResponse(
            content=f"""
            <html>
                <head>
                    <title>Connection Successful</title>
                    <style>
                        body {{
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                            max-width: 600px;
                            margin: 50px auto;
                            padding: 20px;
                            background: #f5f5f5;
                        }}
                        .card {{
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }}
                        h1 {{ color: #2e7d32; margin-top: 0; }}
                        .info {{ 
                            background: #f0f7ff;
                            padding: 15px;
                            border-radius: 4px;
                            margin: 20px 0;
                        }}
                        .info-row {{
                            display: flex;
                            justify-content: space-between;
                            margin: 8px 0;
                        }}
                        .label {{ font-weight: 600; }}
                        .value {{ color: #555; }}
                        button {{
                            background: #1976d2;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 16px;
                            margin-top: 20px;
                        }}
                        button:hover {{ background: #1565c0; }}
                    </style>
                </head>
                <body>
                    <div class="card">
                        <h1>✅ Connection Successful!</h1>
                        <p>Your {platform.replace('_', ' ').title()} account has been connected.</p>
                        
                        <div class="info">
                            <div class="info-row">
                                <span class="label">Platform:</span>
                                <span class="value">{platform.replace('_', ' ').title()}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Account:</span>
                                <span class="value">{account_info['account_name']}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Account ID:</span>
                                <span class="value">{account_info['account_id']}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Connection ID:</span>
                                <span class="value">{connection.id}</span>
                            </div>
                            <div class="info-row">
                                <span class="label">Status:</span>
                                <span class="value" style="color: #2e7d32; font-weight: 600;">Active</span>
                            </div>
                        </div>
                        
                        <p style="color: #666; font-size: 14px;">
                            Your credentials are encrypted and stored securely. 
                            Tokens will be automatically refreshed before expiration.
                        </p>
                        
                        <button onclick="window.close()">Close Window</button>
                    </div>
                </body>
            </html>
            """
        )
        
    except Exception as e:
        logger.error(f"OAuth callback failed for {platform}: {str(e)}", exc_info=True)
        db.rollback()
        
        return HTMLResponse(
            content=f"""
            <html>
                <head><title>Connection Failed</title></head>
                <body style="font-family: sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1 style="color: #d32f2f;">Connection Failed</h1>
                    <p><strong>Platform:</strong> {platform}</p>
                    <p><strong>Error:</strong> {str(e)}</p>
                    <p>Please try again or contact support if the problem persists.</p>
                    <p><a href="/">Return to Home</a></p>
                </body>
            </html>
            """,
            status_code=500
        )


@router.get("/{platform}/status")
async def connection_status(
    platform: str,
    db: Session = Depends(get_db)
):
    """Check connection status and token health for a platform."""
    
    platform_record = db.query(Platform).filter(
        Platform.name == PlatformType(platform)
    ).first()
    
    if not platform_record:
        raise HTTPException(404, f"Platform {platform} not found")
    
    connections = db.query(AdAccountConnection).filter(
        AdAccountConnection.platform_id == platform_record.id
    ).all()
    
    return {
        "platform": platform,
        "total_connections": len(connections),
        "active_connections": sum(1 for c in connections if c.status == ConnectionStatus.ACTIVE),
        "connections": [
            {
                "id": conn.id,
                "account_id": conn.external_account_id,
                "account_name": conn.account_name,
                "status": conn.status.value,
                "expires_at": conn.oauth_tokens.expires_at.isoformat() if conn.oauth_tokens else None,
                "needs_refresh": conn.oauth_tokens and conn.oauth_tokens.expires_at < conn.oauth_tokens.expires_at.now() if conn.oauth_tokens else False,
            }
            for conn in connections
        ]
    }
