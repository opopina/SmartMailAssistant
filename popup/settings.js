class SettingsManager {
  static async saveApiKeys(apiKeys) {
    await browser.storage.local.set({
      openaiKey: apiKeys.openai,
      claudeKey: apiKeys.claude
    });
  }

  static async getApiKeys() {
    const result = await browser.storage.local.get(['openaiKey', 'claudeKey']);
    return {
      openai: result.openaiKey || '',
      claude: result.claudeKey || ''
    };
  }
} 