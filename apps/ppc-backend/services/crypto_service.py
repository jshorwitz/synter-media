import os
import base64
import json
from typing import Dict, Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
import logging

logger = logging.getLogger(__name__)


class CryptoService:
    """
    Handles encryption/decryption of sensitive credentials using envelope encryption.
    
    In production, use cloud KMS (AWS KMS, GCP KMS, or HashiCorp Vault).
    For local development, uses a master key from environment.
    """
    
    _instance = None
    _fernet = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._fernet is None:
            self._initialize_crypto()
    
    def _initialize_crypto(self):
        """Initialize the encryption system."""
        master_key = os.getenv("CREDENTIAL_MASTER_KEY")
        
        if not master_key:
            logger.warning(
                "CREDENTIAL_MASTER_KEY not set. Generating temporary key for local dev. "
                "This is INSECURE for production!"
            )
            master_key = Fernet.generate_key().decode()
            logger.info(f"Generated temporary key (save to .env): CREDENTIAL_MASTER_KEY={master_key}")
        
        if isinstance(master_key, str):
            master_key = master_key.encode()
        
        try:
            self._fernet = Fernet(master_key)
            logger.info("CryptoService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize CryptoService: {e}")
            raise ValueError("Invalid CREDENTIAL_MASTER_KEY") from e
    
    def encrypt(self, plaintext: str) -> str:
        """
        Encrypt plaintext and return base64-encoded ciphertext.
        
        Args:
            plaintext: The sensitive data to encrypt
            
        Returns:
            Base64-encoded encrypted data with metadata
        """
        if not plaintext:
            raise ValueError("Cannot encrypt empty plaintext")
        
        try:
            plaintext_bytes = plaintext.encode('utf-8')
            encrypted = self._fernet.encrypt(plaintext_bytes)
            
            envelope = {
                "version": "v1",
                "ciphertext": base64.b64encode(encrypted).decode('utf-8')
            }
            
            return json.dumps(envelope)
            
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise
    
    def decrypt(self, ciphertext_envelope: str) -> str:
        """
        Decrypt ciphertext and return plaintext.
        
        Args:
            ciphertext_envelope: JSON envelope with encrypted data
            
        Returns:
            Decrypted plaintext string
        """
        if not ciphertext_envelope:
            raise ValueError("Cannot decrypt empty ciphertext")
        
        try:
            envelope = json.loads(ciphertext_envelope)
            
            if envelope.get("version") != "v1":
                raise ValueError(f"Unsupported encryption version: {envelope.get('version')}")
            
            ciphertext_bytes = base64.b64decode(envelope["ciphertext"])
            decrypted = self._fernet.decrypt(ciphertext_bytes)
            
            return decrypted.decode('utf-8')
            
        except json.JSONDecodeError:
            logger.error("Invalid ciphertext envelope format")
            raise ValueError("Invalid ciphertext format")
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise
    
    def rotate_key(self, old_ciphertext: str, new_master_key: Optional[str] = None) -> str:
        """
        Re-encrypt data with a new master key (for key rotation).
        
        Args:
            old_ciphertext: Data encrypted with old key
            new_master_key: New master key (optional, uses current if not provided)
            
        Returns:
            Re-encrypted ciphertext
        """
        plaintext = self.decrypt(old_ciphertext)
        
        if new_master_key:
            old_fernet = self._fernet
            self._fernet = Fernet(new_master_key.encode())
            new_ciphertext = self.encrypt(plaintext)
            self._fernet = old_fernet
            return new_ciphertext
        
        return self.encrypt(plaintext)


crypto_service = CryptoService()
