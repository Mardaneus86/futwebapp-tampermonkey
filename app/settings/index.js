/* globals $ */
/* eslint-disable no-restricted-syntax */

import './index.scss';
import { analytics } from '../core';
import settingsPage from './html/index/settings.html';

const handleFieldChange = (entry, setting, e) => {
  if (setting.subsettings && setting.subsettings.length > 0) {
    entry.changeValue(setting.key, e.target.checked);
  } else if (setting.type === 'checkbox') {
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

const renderSettingsEntry = (setting, entry) => {
  const inputId = `${entry.id}:${setting.key}`;
  return `<div class="setting">
    ${setting.type !== 'checkbox' ? `<label for="${inputId}">${setting.label}</label>` : ''}
    <input
      type="${setting.type}"
      id="${inputId}"
      data-feature-setting-id="${entry.id}:${setting.key}"
      value="${setting.value}"
      ${setting.type === 'checkbox' && setting.value.toString() === 'true' ? 'checked' : ''}
    />
    ${setting.type === 'checkbox' ? `<label for="${inputId}">${setting.label}</label>` : ''}
  </div>`;
};

export default (settings) => {
  const html = settingsPage;

  $('body').prepend(html);

  const settingsPanel = $('.futsettings #settingspanel');

  for (const entry of settings.getEntries()) {
    const checked = entry.isActive ? 'checked="checked"' : '';
    settingsPanel.append(`<h3 class="main-setting">
      <input type="checkbox" id="${entry.id}" data-feature-id="${entry.id}" ${checked} />
      <label for="${entry.id}">${entry.name}</label>
    </h3>`);
    let settingsFields = '';
    if (entry.settings && entry.settings.length > 0) {
      for (const setting of entry.settings) {
        if (setting.subsettings.length > 0) {
          settingsFields += renderSettingsEntry(setting, entry);

          const settingActive = setting.value ? 'block' : 'none';
          settingsFields += `<div data-parent-feature-setting-id="${entry.id}:${setting.key}" style="display: ${settingActive}">`;
          for (const subsetting of setting.subsettings) {
            settingsFields += renderSettingsEntry(subsetting, entry);
          }
          settingsFields += '</div>';
        } else {
          settingsFields += renderSettingsEntry(setting, entry);
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
