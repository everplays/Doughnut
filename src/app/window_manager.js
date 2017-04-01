/*
 * Doughnut Podcast Client
 * Copyright (C) 2017 Chris Dyer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import Electron from 'electron'
import url from 'url'
import path from 'path'
const { ipcMain, dialog, shell, clipboard, app } = require('electron')
const EventEmitter = require('events')

import MainWindow from './windows/main_window'
import PreferencesWindow from './windows/preferences'
import Library from './library/manager'
import Player from './player'
import Settings from './settings'

class WindowManager extends EventEmitter {
  constructor () {
    super()
    const wm = this

    this.selected = {
      podcastId: false,
      episodeId: false
    }

    this.windows = {
      MainWindow: false,
      WelcomeWindow: false,
      PreferencesWindow: false
    }

    Player.on('state', state => {
      if (wm.windows.MainWindow) {
        wm.windows.MainWindow.send('player:state', state)
      }
    })
  }

  selectedPodcast () {
    return Library().loadPodcast(this.selected.podcastId)
  }

  selectedEpisode () {
    return Library().loadEpisode(this.selected.episodeId)
  }

  main () {
    return this.main
  }

  teardown () {
  }

  setup () {
    const wm = this

    // Podcast Action
    ipcMain.on('podcast:subscribe', (event, arg) => {
      wm.subscribeWindow().close()

      Library().subscribe(arg)
      .catch((err) => {
        dialog.showErrorBox('Invalid Feed', 'Doughnut was unable to parse the feed at: ' + url + '\n' + err)
        return null
      })

      console.log('done')
    })

    ipcMain.on('podcast:reload', (event, arg) => {
      Library().loadPodcast(arg.id)
        .then(podcast => {
          return Library().reload(podcast)
        })
    })

    ipcMain.on('podcast:subscribe:new', (event, arg) => {
      wm.subscribeWindow().show()
    })

    ipcMain.on('podcast:unsubscribe', (event, arg) => {
      Library().loadPodcast(arg.id)
        .then(function (podcast) {
          dialog.showMessageBox({
            buttons: ['Leave Files', 'Delete Files'],
            message: 'Delete Episodes?',
            detail: `Would you like to permanently delete all downloaded episodes of ${podcast.title}`
          }, deleteFiles => {
            if (deleteFiles) {
              Library().unsubscribe(podcast, { permanent: true })
            } else {
              Library().unsubscribe(podcast, { permanent: false })
            }

            return null
          })
        })
    })

    ipcMain.on('podcast:played', (event, arg) => {
      Library().markPodcastAllPlayed(arg.id, true)
    })

    ipcMain.on('podcast:unplayed', (event, arg) => {
      Library().markPodcastAllPlayed(arg.id, false)
    })

    ipcMain.on('podcast:select', (event, arg) => {
      if (arg.id > 0) {
        wm.selected.podcastId = arg.id
        wm.emit('selection', wm.selected)
      } else {
        wm.selected.podcastId = false
      }
    })

    // Player Action
    ipcMain.on('player:toggle', (event, arg) => {
      Player.toggle()
    })

    ipcMain.on('player:seek', (event, arg) => {
      Player.seekTo(arg)
    })

    ipcMain.on('player:volume', (event, arg) => {
      Player.setVolume(arg)
    })

    // Episode Action

    ipcMain.on('episode:select', (event, arg) => {
      if (arg.id > 0) {
        wm.selected.episodeId = arg.id
        wm.emit('selection', wm.selected)
      } else {
        wm.selected.episodeId = false
      }
    })

    ipcMain.on('episode:play', (event, arg) => {
      console.log('episode:play', arg)

      Library().loadEpisode(arg.id)
        .then(episode => {
          Player.load(episode)
        })
    })

    ipcMain.on('episode:download', (event, arg) => {
      Library().loadEpisode(arg.id)
        .then(episode => {
          Library().downloadEpisode(episode)
        })
    })

    ipcMain.on('episode:favourite', (event, arg) => {
      Library().markEpisodeFavourite(arg.id, true)
    })

    ipcMain.on('episode:unfavourite', (event, arg) => {
      Library().markEpisodeFavourite(arg.id, false)
    })

    ipcMain.on('episode:played', (event, arg) => {
      Library().markEpisodePlayed(arg.id, true)
    })

    ipcMain.on('episode:unplayed', (event, arg) => {
      Library().markEpisodePlayed(arg.id, false)
    })

    ipcMain.on('episode:reveal', (event, arg) => {
      Library().loadEpisode(arg.id)
        .then(episode => {
          shell.showItemInFolder(episode.Podcast.fileName(episode))
        })
    })

    // Settings

    ipcMain.on('settings:save', (event, arg) => {
      console.log('settings:save', arg)

      if (Settings.restartNeeded(arg)) {
        dialog.showMessageBox({
          type: 'question',
          buttons: ['Ok', 'Cancel'],
          defaultId: 0,
          message: 'Restart Needed',
          detail: 'You are about to change a setting that requires Doughnut to close and reopen in order to apply it. After clicking ok, Doughnut will quit. Please reopen it to proceed.'
        }, response => {
          if (response === 0 /* Ok */) {
            Settings.update(arg)
            wm.preferencesWindow().close()
            app.quit()
          }
        })
      } else {
        Settings.update(arg)
        wm.preferencesWindow().close()
      }
    })

    // Misc

    ipcMain.on('link', (event, arg) => {
      console.log('Opening link: ', arg)
      shell.openExternal(arg)
    })

    ipcMain.on('clipboard:set', (event, arg) => {
      clipboard.writeText(arg)
    })
  }

  mainWindow (server) {
    if (this.windows.MainWindow) { return this.windows.MainWindow }

    this.windows.MainWindow = new MainWindow(server)
    return this.windows.MainWindow
  }

  preferencesWindow () {
    if (this.windows.PreferencesWindow) { return this.windows.PreferencesWindow }

    this.windows.PreferencesWindow = new PreferencesWindow()
    return this.windows.PreferencesWindow
  }

  subscribeWindow () {
    const w = new Electron.BrowserWindow({
      width: 500,
      height: 170,
      resizable: false
    })
    w.setMenu(null)

    w.loadURL(url.format({
      pathname: path.join(__dirname, 'subscribe.html'),
      protocol: 'file:',
      slashes: true
    }))

    if (Settings.isDevelopment()) {
      w.webContents.openDevTools({
        mode: 'detach'
      })
    }

    return w
  }

  welcomeWindow () {
    if (this.windows.WelcomeWindow) { return this.windows.WelcomeWindow }

    const w = new Electron.BrowserWindow({
      width: 500,
      height: 300,
      resizable: false,
      titleBarStyle: 'hidden-inset'
    })

    w.loadURL(url.format({
      pathname: path.join(__dirname, 'welcome.html'),
      protocol: 'file:',
      slashes: true
    }))

    this.windows.WelcomeWindow = w
    return w
  }
}

export default new WindowManager()
