/*
 * Director: 指挥
 * 在某个部件中侦听某个值是否为true, 如true,执行动作,然后赋值为false
 */
import { writable } from 'svelte/store';

export const director_work_searchNow = writable(false);
