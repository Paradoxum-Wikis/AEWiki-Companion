interface DiscordMember {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  status: 'online' | 'idle' | 'dnd' | 'offline';
  avatar_url: string;
}

interface DiscordChannel {
  id: string;
  name: string;
  position: number;
}

interface DiscordWidgetData {
  id: string;
  name: string;
  instant_invite: string | null;
  channels: DiscordChannel[];
  members: DiscordMember[];
  presence_count: number;
}

class DiscordWidget {
  private readonly guildId: string = '1362084781134708907';
  private readonly inviteLink: string = 'https://discord.com/invite/yfZUQ3h4cf';
  private widgetContainer: HTMLElement | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    document.addEventListener('DOMContentLoaded', () => {
      this.widgetContainer = document.getElementById('discordWidget');
      if (this.widgetContainer) {
        this.loadWidget();
      }
    });
  }

  private async loadWidget(): Promise<void> {
    if (!this.widgetContainer) return;

    try {
      const data = await this.fetchDiscordData();
      this.renderWidget(data);
    } catch (error) {
      console.warn('Failed to load Discord widget:', error);
      this.renderFallbackWidget();
    }
  }

  private async fetchDiscordData(): Promise<DiscordWidgetData> {
    const response = await fetch(`https://discord.com/api/guilds/${this.guildId}/widget.json`);
    
    if (!response.ok) {
      throw new Error(`Discord API unavailable: ${response.status}`);
    }
    
    return response.json();
  }

  private renderWidget(data: DiscordWidgetData): void {
    if (!this.widgetContainer) return;

    const onlineMembers = this.countOnlineMembers(data.members);
    const totalMembers = data.presence_count || 0;

    this.widgetContainer.innerHTML = `
      <div class="discord-header">
        <div class="discord-icon"></div>
        <h4 class="mb-0">${this.escapeHtml(data.name || 'ALTER EGO Discord')}</h4>
      </div>
      
      <div class="discord-stats">
        <div class="discord-stat">
          <div class="discord-stat-number member">${totalMembers}</div>
          <div class="discord-stat-label">Active Now</div>
        </div>
        <div class="discord-stat">
          <div class="discord-stat-number">${onlineMembers}</div>
          <div class="discord-stat-label">Online</div>
        </div>
      </div>
      
      ${this.renderMembersList(data.members)}
      
      <div class="text-center">
        <a href="${this.inviteLink}" 
           target="_blank" 
           class="discord-join-btn">
          <i class="bi bi-discord"></i>
          Join Discord Server
        </a>

        <p class="mt-3 mb-0 text-center">Join our Discord community to chat with other fans, get updates, participate in discussions, and help build the ultimate ALTER EGO resource!</p>
      </div>
    `;
  }

  private renderFallbackWidget(): void {
    if (!this.widgetContainer) return;

    this.widgetContainer.innerHTML = `
      <div class="discord-header">
        <div class="discord-icon"></div>
        <h4 class="mb-0">ALTER EGO Discord</h4>
      </div>
      
      <p class="mb-3 text-center">Join our Discord community to chat with other fans, get updates, participate in discussions, and help build the ultimate ALTER EGO resource!</p>
      
      <div class="text-center">
        <a href="${this.inviteLink}" 
           target="_blank" 
           class="discord-join-btn">
          <i class="bi bi-discord"></i>
          Join Discord Server
        </a>
      </div>
    `;
  }

  private countOnlineMembers(members: DiscordMember[]): number {
    return members ? members.filter(member => member.status === 'online').length : 0;
  }

  private renderMembersList(members: DiscordMember[]): string {
    if (!members || members.length === 0) {
      return '';
    }

    const displayMembers = members.slice(0, 20);
    const remainingCount = Math.max(0, members.length - 20);

    const memberItems = displayMembers.map(member => `
      <div class="discord-member">
        <div class="discord-member-status ${member.status}"></div>
        ${this.escapeHtml(member.username)}
      </div>
    `).join('');

    const remainingText = remainingCount > 0 
      ? `<div class="discord-member">... and ${remainingCount} more</div>` 
      : '';

    return `
      <div class="discord-members">
        ${memberItems}
        ${remainingText}
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

new DiscordWidget();