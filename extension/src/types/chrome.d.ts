// Type definitions for Chrome extension API
// This file provides TypeScript type definitions for the Chrome extension API

declare namespace chrome {
  namespace runtime {
    interface MessageSender {
      tab?: chrome.tabs.Tab;
      frameId?: number;
      id?: string;
      url?: string;
      tlsChannelId?: string;
    }

    interface Port {
      name: string;
      disconnect(): void;
      postMessage(message: any): void;
      onDisconnect: {
        addListener(callback: (port: Port) => void): void;
        removeListener(callback: (port: Port) => void): void;
      };
      onMessage: {
        addListener(callback: (message: any, port: Port) => void): void;
        removeListener(callback: (message: any, port: Port) => void): void;
      };
    }

    interface OnInstalledDetails {
      reason: 'install' | 'update' | 'chrome_update' | 'shared_module_update';
      previousVersion?: string;
      id?: string;
    }

    interface OnMessageEvent {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
      removeListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    }

    const onInstalled: {
      addListener(callback: (details: OnInstalledDetails) => void): void;
    };

    const onMessage: OnMessageEvent;

    function sendMessage(
      extensionId: string,
      message: any,
      options?: object,
      responseCallback?: (response: any) => void
    ): void;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      index: number;
      windowId: number;
      openerTabId?: number;
      selected: boolean;
      highlighted: boolean;
      active: boolean;
      pinned: boolean;
      audible?: boolean;
      discarded: boolean;
      autoDiscardable: boolean;
      mutedInfo?: MutedInfo;
      url?: string;
      title?: string;
      favIconUrl?: string;
      status?: string;
      incognito: boolean;
      width?: number;
      height?: number;
      sessionId?: string;
    }

    interface MutedInfo {
      muted: boolean;
      reason?: string;
      extensionId?: string;
    }

    function query(queryInfo: object): Promise<Tab[]>;
    function sendMessage(tabId: number, message: any, options?: object): Promise<any>;
  }

  namespace contextMenus {
    interface CreateProperties {
      id?: string;
      title: string;
      contexts?: string[];
      documentUrlPatterns?: string[];
      targetUrlPatterns?: string[];
      type?: 'normal' | 'checkbox' | 'radio' | 'separator';
      parentId?: string | number;
      onclick?: (info: OnClickData, tab: tabs.Tab) => void;
    }

    interface OnClickData {
      menuItemId: string | number;
      parentMenuItemId?: string | number;
      mediaType?: string;
      linkUrl?: string;
      srcUrl?: string;
      pageUrl?: string;
      frameUrl?: string;
      selectionText?: string;
      editable: boolean;
      wasChecked?: boolean;
      checked?: boolean;
    }

    function create(createProperties: CreateProperties): void;
    const onClicked: {
      addListener(callback: (info: OnClickData, tab: tabs.Tab) => void): void;
    };
  }

  namespace storage {
    interface StorageArea {
      get(keys: string | string[] | object | null): Promise<object>;
      set(items: object): Promise<void>;
      remove(keys: string | string[]): Promise<void>;
      clear(): Promise<void>;
    }

    const local: StorageArea;
    const sync: StorageArea;
  }
}
