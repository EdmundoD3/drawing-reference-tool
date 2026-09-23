// main.ts
import { mount } from 'svelte'
import './styles/app.css'
import './styles/mobileApp.css'
import './styles/rotate.css'
import './styles/stageBars.css'
import App from './App.svelte'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
