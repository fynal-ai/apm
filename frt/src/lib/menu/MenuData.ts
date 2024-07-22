import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export type menuItemType = {
  level?: number;
  id: string;
  class?: string | string[];
  display: boolean;
  folder: string;
  alias?: string;
  icon?: string;
  img?: string;
  href?: string;
  target?: string;
  parent?: menuDataType;
  sub?: Partial<menuItemType>[];
  visible?: boolean;
  check_visible?: {
    fn: (
      what: string,
      expect: boolean | string | number | undefined | null | ArrayLike<boolean | string | number>
    ) => boolean;
    what: string;
    expect: boolean | string | number | undefined | null | ArrayLike<boolean | string | number>;
  };
  hasSub: boolean;
  expanded: boolean;
  path: string;
  callback?: string;
  payload?: Record<string, string | number | boolean>;
};

export type menuDataType = Omit<
  menuItemType,
  'level' | 'display' | 'folder' | 'hasSub' | 'expanded' | 'path'
>;

export type menuConfigType = {
  expandOneOnSameLevel: boolean;
};
export const menuConfig: Writable<menuConfigType> = writable({ expandOneOnSameLevel: true });
export const menuMode = writable('float-small');
export const menuRefreshFlag = writable(false);
export const menuReloadRecent = writable(false);
export const menuMobile = writable(false);
export const menuInSession = writable(false);
export const overPath = writable('');
export const menuDataForGet = writable([] as menuDataType[]);
export const menuDataForSet = writable([] as menuDataType[]);
export const menuDataForSetting = writable([] as Partial<menuItemType>[]);
export const menuDataFromServer = writable([] as Partial<menuItemType>[]);
export const menuExtra = writable([] as Partial<menuItemType>[]);
export const demoData = writable({});
