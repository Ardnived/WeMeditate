import zenscroll from 'zenscroll'
import { sendAnalyticsEvent } from '../util'

export default class SubtleSystem {

  constructor(element) {
    this.activeNode = null
    this.container = element
    this.loadNodes('#hover_chakras')
    this.loadNodes('#hover_channels')

    this.activeTab = element.querySelector('.subtle-system__toggle__item--active')
    element.querySelector('.subtle-system__toggle').addEventListener('click', event => this.onSelectTab(event.target))
  }

  loadNodes(containerSelector) {
    const nodesContainer = this.container.querySelector(containerSelector)

    for (let index = 0; index < nodesContainer.childElementCount; index++) {
      const node = nodesContainer.children[index]
      node.addEventListener('mouseover', event => this.onNodeMouseover(event.currentTarget))
      node.addEventListener('mouseout', event => this.onNodeMouseout(event.currentTarget))
      node.addEventListener('click', event => this.onNodeClick(event.currentTarget))
    }
  }

  unload() {
    this.container.classList.add('subtle-system--animated')
    this.setNodeSelected(this.activeNode, false)
    this.activeNode = null
  }

  onSelectTab(element) {
    if (element.dataset.tab != this.activeTab.dataset.tab && element.classList.contains('subtle-system__toggle__item')) {
      this.activeTab.classList.remove('subtle-system__toggle__item--active')
      this.container.classList.remove(`subtle-system--${this.activeTab.dataset.tab}`)
      this.activeTab = element
      this.container.classList.add(`subtle-system--${element.dataset.tab}`)
      this.activeTab.classList.add('subtle-system__toggle__item--active')

      this.container.classList.add('subtle-system--animated')
      this.setNodeSelected(this.activeNode, false)
      this.activeNode = null
    }
  }

  onNodeMouseover(node) {
    const targetActiveNode = node.id

    if (targetActiveNode != this.activeNode) {
      // Some of the nodes are contained within other nodes, so for some nodes,
      // we use a timer to make sure that the person really wants to select the node they are hovering on.
      let time = 0

      if ((this.activeNode == 'chakra_2' || this.activeNode == 'chakra_3') && targetActiveNode == 'chakra_3b') {
        time = 300
      } else if (this.activeNode == 'chakra_3b' && (targetActiveNode == 'chakra_2' || targetActiveNode == 'chakra_3')) {
        time = 300
      }

      this.timeout = setTimeout(() => {
        // Select the new node, and deselect the old one.
        this.container.classList.remove('subtle-system--animated')

        this.setNodeSelected(this.activeNode, false)
        this.setNodeSelected(targetActiveNode, true)
        this.activeNode = targetActiveNode
      }, time)
    }
  }

  // nodeed when the user stops hovering over a particular chakra/channel.
  onNodeMouseout(_node) {
    // Clear the timeout because we don't want to select this node after all.
    clearTimeout(this.timeout)
    this.timeout = null
  }

  onNodeClick(node) {
    this.scrollToNode(node.id)
  }

  setNodeSelected(id, selected) {
    if (!id) return

    const selector = id.replace(/_/g, '-')
    const element = this.container.querySelector(`#${id}`)
    const was_selected = element.classList.contains('active')
    element.classList.toggle('active', selected)
    const item = this.container.querySelector(`.subtle-system__item--${selector}`)
    
    if (item) {
      item.classList.toggle('subtle-system__item--active', selected)
      if (!was_selected && selected) {
        this.scrollToNode(id)
        sendAnalyticsEvent('Node Selected', { globalTitle: selector, localTitle: item.querySelector('.preview__title').innerText })
      }
    }
  }

  scrollToNode(id) {
    if (window.innerWidth > 768) return

    const selector = id.replace(/_/g, '-')
    const item = this.container.querySelector(`.subtle-system__item--${selector}`)
    zenscroll.intoView(item)
  }

}
