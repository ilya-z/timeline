import { STORAGE_KEY } from "../../utils/constants";

export default class StorageService {
  private storage: chrome.storage.LocalStorageArea;

  constructor() {
    this.storage = chrome.storage.local;
  }

  //
  // Private methods.
  //

  _get(key: string) {
    return new Promise((resolve) => {
      this.storage.get(key, (result) => resolve(result[key]));
    });
  }

  _set(key: string, value: any) {
    this.storage.set({ [key]: value });
  }

  _onChanged(key: string, callback: Function) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.hasOwnProperty(key)) {
        callback(changes[key].newValue);
      }
    });
  }

  //
  // Public methods.
  //

  async getSettings(): Promise<any> {
    return await this._get(STORAGE_KEY.SETTINGS);
  }

  setSettings(settings: any) {
    this._set(STORAGE_KEY.SETTINGS, settings);
  }

  setShowTimeline(showTimeline: boolean) {
    this.getSettings().then((settings) => {
      if (settings.showTimeline !== showTimeline) {
        this.setSettings({ ...settings, showTimeline });
      }
    });
  }

  setTransparencyAndButton(transparency: number, showButton: boolean) {
    this.getSettings().then((settings) => {
      this.setSettings({ ...settings, transparency, showButton });
    });
  }

  onSettingsChanged(callback: Function) {
    this._onChanged(STORAGE_KEY.SETTINGS, callback);
  }
}
