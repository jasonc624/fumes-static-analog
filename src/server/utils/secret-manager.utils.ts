import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export class SecretManager {
  private client: SecretManagerServiceClient;
  private projectId: string;

  constructor(projectId?: string) {
    // Handle different credential sources for different environments
    const credentialsJson = import.meta.env['GOOGLE_APPLICATION_CREDENTIALS_JSON'];
    const credentialsPath = import.meta.env['GOOGLE_APPLICATION_CREDENTIALS'];
    
    if (credentialsJson) {
      // Parse JSON credentials (for Vercel/cloud deployment)
      try {
        const credentials = JSON.parse(credentialsJson);
        this.client = new SecretManagerServiceClient({
          credentials: credentials
        });
        console.log(`🔑 Using JSON credentials from environment variable`);
      } catch (error) {
        throw new Error(`Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS_JSON: ${error}`);
      }
    } else if (credentialsPath) {
      // Use file path credentials (for local development)
      this.client = new SecretManagerServiceClient();
      console.log(`📄 Service account key file: ${credentialsPath}`);
    } else {
      // Use Google Application Default Credentials (ADC)
      // This will automatically pick up credentials from:
      // 1. gcloud auth application-default login
      // 2. Google Cloud metadata server (when running on GCP)
      this.client = new SecretManagerServiceClient();
      console.log(`🌐 Using default credentials (gcloud or metadata server)`);
    }
    
    this.projectId = projectId || process.env['GOOGLE_CLOUD_PROJECT_ID'] || '';
    
    if (!this.projectId) {
      throw new Error('Project ID is required. Set GOOGLE_CLOUD_PROJECT_ID environment variable or provide projectId parameter.');
    }
    
    console.log(`🔐 SecretManager initialized for project: ${this.projectId}`);
  }

  /**
   * Access a secret from Google Secret Manager
   * @param secretName - The name of the secret
   * @param version - The version of the secret (defaults to 'latest')
   * @returns The secret value as a string
   */
  async getSecret(secretName: string, version: string = 'latest'): Promise<string> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;
      console.log("ATTEMPTING TO ACCESS SECRET", name);
      
      const [response] = await this.client.accessSecretVersion({
        name: name,
      });

      const payload = response.payload?.data?.toString();
      
      if (!payload) {
        throw new Error(`Secret ${secretName} is empty or not found`);
      }

      return payload;
    } catch (error: any) {
      console.error(`Error accessing secret ${secretName}:`, error);
      throw new Error(`Failed to access secret ${secretName}: ${error.message}`);
    }
  }

  /**
   * Access multiple secrets at once
   * @param secretNames - Array of secret names
   * @param version - The version of the secrets (defaults to 'latest')
   * @returns Object with secret names as keys and values as strings
   */
  async getSecrets(secretNames: string[], version: string = 'latest'): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {};
    
    const promises = secretNames.map(async (secretName) => {
      try {
        const value = await this.getSecret(secretName, version);
        secrets[secretName] = value;
      } catch (error) {
        console.error(`Failed to get secret ${secretName}:`, error);
        // Continue with other secrets even if one fails
      }
    });

    await Promise.all(promises);
    return secrets;
  }

  /**
   * Check if a secret exists
   * @param secretName - The name of the secret
   * @returns Boolean indicating if the secret exists
   */
  async secretExists(secretName: string): Promise<boolean> {
    try {
      const name = `projects/${this.projectId}/secrets/${secretName}`;
      await this.client.getSecret({ name });
      return true;
    } catch (error: any) {
      if (error.code === 5) { // NOT_FOUND
        return false;
      }
      throw error;
    }
  }

  /**
   * List all secrets in the project
   * @returns Array of secret names
   */
  async listSecrets(): Promise<string[]> {
    try {
      const parent = `projects/${this.projectId}`;
      const [secrets] = await this.client.listSecrets({ parent });
      
      return secrets.map(secret => {
        const nameParts = secret.name?.split('/');
        return nameParts?.[nameParts.length - 1] || '';
      }).filter(name => name !== '');
    } catch (error: any) {
      console.error('Error listing secrets:', error);
      throw new Error(`Failed to list secrets: ${error.message}`);
    }
  }
}

// Export a singleton instance for convenience
let secretManagerInstance: SecretManager | null = null;

export function getSecretManager(projectId?: string): SecretManager {
  if (!secretManagerInstance) {
    secretManagerInstance = new SecretManager(projectId);
  }
  return secretManagerInstance;
}

// Export individual functions for easier usage
export async function getSecret(secretName: string, version: string = 'latest', projectId?: string): Promise<string> {
  const manager = getSecretManager(projectId);
  return manager.getSecret(secretName, version);
}

export async function getSecrets(secretNames: string[], version: string = 'latest', projectId?: string): Promise<Record<string, string>> {
  const manager = getSecretManager(projectId);
  return manager.getSecrets(secretNames, version);
}