/* globals $ */
/* eslint-disable no-restricted-syntax */

import './index.scss';
import { analytics } from '../core';
import settingsPage from './html/index/settings.html';

const handleFieldChange = (entry, setting, e) => {
  if (setting.subsettings && setting.subsettings.length > 0) {
    entry.changeValue(setting.key, e.target.checked);
  } else {
    entry.changeValue(setting.key, e.target.value);
  }

  if (setting.callback) {
    setting.callback(e.target.value);
  }
  if (setting.subsettings && setting.subsettings.length > 0) {
    $(`[data-parent-feature-setting-id='${entry.id}:${setting.key}']`).toggle();
  }
};

export default (settings) => {
  const html = settingsPage;

  $('body').prepend(html);

  const settingsPanel = $('.futsettings');
  for (const entry of settings.getEntries()) {
    const checked = entry.isActive ? 'checked="checked"' : '';
    settingsPanel.append(`<h3><input type="checkbox" id="${entry.id}" data-feature-id="${entry.id}" ${checked}></input><label for="${entry.id}">${entry.name}</label></h3>`);
    let settingsFields = '';
    if (entry.settings && entry.settings.length > 0) {
      for (const setting of entry.settings) {
        if (setting.subsettings.length > 0) {
          const subChecked = setting.value ? 'checked="checked"' : '';
          settingsFields += `<input type="checkbox" id="${entry.id}:${setting.key}" data-feature-setting-id="${entry.id}:${setting.key}" ${subChecked}></input>
            <label for="${entry.id}:${setting.key}">${setting.label}</label>`;

          const settingActive = setting.value ? 'block' : 'none';
          settingsFields += `<div data-parent-feature-setting-id="${entry.id}:${setting.key}" style="display: ${settingActive}">`;
          for (const subsetting of setting.subsettings) {
            settingsFields += `<div class="setting"><label for="${entry.id}:${subsetting.key}">${subsetting.label}</label>
              <input type="text" id="${entry.id}:${subsetting.key}" data-feature-setting-id="${entry.id}:${subsetting.key}" value="${subsetting.value}"></input></div>`;
          }
          settingsFields += '</div>';
        } else {
          settingsFields += `<div class="setting"><label for="${entry.id}:${setting.key}">${setting.label}</label>
            <input type="text" id="${entry.id}:${setting.key}" data-feature-setting-id="${entry.id}:${setting.key}" value="${setting.value}"></input></div>`;
        }
      }
      const featureActive = entry.isActive ? 'block' : 'none';
      settingsPanel.append(`<div class="feature-settings"><div data-feature-settings="${entry.id}" style="display: ${featureActive};">${settingsFields}</div></div>`);
      for (const setting of entry.settings) {
        $(`[data-feature-setting-id='${entry.id}:${setting.key}']`).on('change', (e) => {
          handleFieldChange(entry, setting, e);
        });
        for (const subsetting of setting.subsettings) {
          $(`[data-feature-setting-id='${entry.id}:${subsetting.key}']`).on('change', (e) => {
            handleFieldChange(entry, subsetting, e);
          });
        }
      }
    } else {
      settingsPanel.append('<div class="feature-settings-empty"></div>');
    }

    $(`[data-feature-id='${entry.id}']`).on('click', () => {
      settings.toggleEntry(entry.id);
      $(`[data-feature-settings='${entry.id}']`).toggle();
    });
  }

  $('.futsettings-toggle').click(() => {
    analytics.trackEvent('Settings', 'Toggle settings', $('.futsettings').is(':visible'));
    $('.futsettings').toggle();
  });
};
