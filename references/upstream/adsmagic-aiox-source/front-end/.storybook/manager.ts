import { addons } from 'storybook/manager-api'
import adsmagicTheme from './theme'

addons.setConfig({
    theme: adsmagicTheme,
    sidebar: {
        showRoots: true,
        collapsedRoots: ['other'],
    },
    toolbar: {
        title: { hidden: false },
        zoom: { hidden: false },
        eject: { hidden: false },
        copy: { hidden: false },
        fullscreen: { hidden: false },
    },
})
