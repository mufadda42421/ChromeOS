import { Category, CategoryId } from '../types';

export interface ClassificationResult {
  categoryId: CategoryId;
  categoryName: string;
  confidence: number;
  method: 'rule' | 'heuristic' | 'ai' | 'override';
  reason: string;
}

/**
 * Intelligent tab categorizer using multi-tier hybrid analysis:
 * 1. User overrides
 * 2. Domain rules & subdomains
 * 3. Semantic keyword heuristics
 * 4. Optional server-side Gemini AI classification for unknown domains
 */
export class TabClassifier {
  /**
   * Extract clean domain from a URL string
   */
  public static extractDomain(url: string): string {
    try {
      if (!url) return '';
      // Handle schemes
      const normalized = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
      const parsed = new URL(normalized);
      return parsed.hostname.toLowerCase().replace(/^www\./, '');
    } catch {
      // Fallback regex
      const match = url.match(/^(?:https?:\/\/)?(?:www\.)?([^\/\s:]+)/i);
      return match ? match[1].toLowerCase() : url.toLowerCase();
    }
  }

  /**
   * Check if a domain matches a rule (e.g. "github.com" or "*.openai.com")
   */
  public static matchesDomainRule(domain: string, rule: string): boolean {
    const cleanRule = rule.trim().toLowerCase().replace(/^www\./, '');
    if (cleanRule.startsWith('*.')) {
      const rootRule = cleanRule.slice(2);
      return domain === rootRule || domain.endsWith('.' + rootRule);
    }
    return domain === cleanRule || domain.endsWith('.' + cleanRule);
  }

  /**
   * Classify a tab synchronously using rule engine + heuristics
   */
  public static classifySync(
    url: string,
    title: string,
    categories: Category[],
    overrides: Record<string, CategoryId> = {}
  ): ClassificationResult {
    const domain = this.extractDomain(url);

    // 1. Check user explicit overrides
    if (domain && overrides[domain]) {
      const matchedCat = categories.find((c) => c.id === overrides[domain]);
      if (matchedCat) {
        return {
          categoryId: matchedCat.id,
          categoryName: matchedCat.name,
          confidence: 1.0,
          method: 'override',
          reason: `Matched user override for ${domain}`,
        };
      }
    }

    // 2. Domain rule matching
    if (domain) {
      for (const cat of categories) {
        for (const rule of cat.rules) {
          if (this.matchesDomainRule(domain, rule)) {
            return {
              categoryId: cat.id,
              categoryName: cat.name,
              confidence: 0.98,
              method: 'rule',
              reason: `Matched domain rule "${rule}"`,
            };
          }
        }
      }
    }

    // 3. Semantic keyword heuristics on URL and Title
    const combined = `${url} ${title}`.toLowerCase();

    // Dev signals
    if (
      /github|gitlab|bitbucket|stack overflow|npm|docker|pull request|commit|repo|api reference|docs|dev|compiler|debugger|git /i.test(
        combined
      )
    ) {
      const devCat = categories.find((c) => c.id === 'development');
      if (devCat) {
        return {
          categoryId: devCat.id,
          categoryName: devCat.name,
          confidence: 0.85,
          method: 'heuristic',
          reason: 'Matched developer terminology',
        };
      }
    }

    // AI & Productivity signals
    if (/chatgpt|gpt|claude|gemini|llm|neural|prompt|notion|workspace|task|kanban|todo|linear|trello/i.test(combined)) {
      const aiCat = categories.find((c) => c.id === 'ai');
      if (aiCat) {
        return {
          categoryId: aiCat.id,
          categoryName: aiCat.name,
          confidence: 0.85,
          method: 'heuristic',
          reason: 'Matched AI & productivity keywords',
        };
      }
    }

    // Design signals
    if (/figma|design|dribbble|behance|vector|palette|typography|mockup|prototype|sketch|illustration|canvas/i.test(combined)) {
      const designCat = categories.find((c) => c.id === 'design');
      if (designCat) {
        return {
          categoryId: designCat.id,
          categoryName: designCat.name,
          confidence: 0.85,
          method: 'heuristic',
          reason: 'Matched design and creative keywords',
        };
      }
    }

    // Entertainment signals
    if (/youtube|video|watch|stream|podcast|music|spotify|track|album|movie|series|game|play|twitch/i.test(combined)) {
      const entCat = categories.find((c) => c.id === 'entertainment');
      if (entCat) {
        return {
          categoryId: entCat.id,
          categoryName: entCat.name,
          confidence: 0.82,
          method: 'heuristic',
          reason: 'Matched media and entertainment keywords',
        };
      }
    }

    // Shopping signals
    if (/shop|store|cart|buy|price|checkout|discount|order|shipping|deal|amazon|ebay/i.test(combined)) {
      const shopCat = categories.find((c) => c.id === 'shopping');
      if (shopCat) {
        return {
          categoryId: shopCat.id,
          categoryName: shopCat.name,
          confidence: 0.82,
          method: 'heuristic',
          reason: 'Matched shopping and commerce keywords',
        };
      }
    }

    // Research signals
    if (/arxiv|doi|paper|journal|abstract|citation|experiment|biology|physics|scholar|thesis/i.test(combined)) {
      const resCat = categories.find((c) => c.id === 'research');
      if (resCat) {
        return {
          categoryId: resCat.id,
          categoryName: resCat.name,
          confidence: 0.85,
          method: 'heuristic',
          reason: 'Matched research and publication keywords',
        };
      }
    }

    // Finance signals
    if (/finance|bank|stock|ticker|crypto|trading|wallet|market|index|dividend|portfolio|invest/i.test(combined)) {
      const finCat = categories.find((c) => c.id === 'finance');
      if (finCat) {
        return {
          categoryId: finCat.id,
          categoryName: finCat.name,
          confidence: 0.85,
          method: 'heuristic',
          reason: 'Matched finance and market terminology',
        };
      }
    }

    // Communication signals
    if (/mail|inbox|message|chat|meeting|call|webinar|conferencing|zoom|teams/i.test(combined)) {
      const commCat = categories.find((c) => c.id === 'communication');
      if (commCat) {
        return {
          categoryId: commCat.id,
          categoryName: commCat.name,
          confidence: 0.8,
          method: 'heuristic',
          reason: 'Matched communication and messaging keywords',
        };
      }
    }

    // Default to first category or AI
    const fallbackCat = categories[0] || { id: 'ai', name: 'AI & Productivity' };
    return {
      categoryId: fallbackCat.id,
      categoryName: fallbackCat.name,
      confidence: 0.5,
      method: 'heuristic',
      reason: 'General category fallback',
    };
  }

  /**
   * Async classify with optional server-side Gemini API assistance
   */
  public static async classifyWithAI(
    url: string,
    title: string,
    categories: Category[],
    overrides: Record<string, CategoryId> = {},
    allowAI: boolean = true
  ): Promise<ClassificationResult> {
    // First try sync classification
    const syncResult = this.classifySync(url, title, categories, overrides);

    // If high confidence rule or override, return immediately without network call
    if (syncResult.confidence >= 0.85 || !allowAI) {
      return syncResult;
    }

    // If confidence is low and AI is enabled, call backend Gemini endpoint
    try {
      const res = await fetch('/api/classify-tab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          title,
          categories: categories.map((c) => c.name),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const matched = categories.find(
          (c) => c.name.toLowerCase() === (data.categoryName || '').toLowerCase()
        );
        if (matched) {
          return {
            categoryId: matched.id,
            categoryName: matched.name,
            confidence: data.confidence || 0.92,
            method: 'ai',
            reason: data.reason || 'Categorized by Gemini model',
          };
        }
      }
    } catch {
      // Fallback silently to syncResult on network/offline
    }

    return syncResult;
  }
}
