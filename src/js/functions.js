let utils = {
  get: (selector) => {
    return document.querySelector(selector)
  }
}

let actions = {
  bindClickMenu: () => {
    utils.get("#open-menu-button").addEventListener('click', (e) => {
      utils.get('.main-navigation').classList.add('open');
      e.preventDefault();
    })
    
    utils.get("#close-menu-button").addEventListener('click', (e) => {
      utils.get('.main-navigation').classList.remove('open');
      e.preventDefault();
    })
  }
}

export {
  utils,
  actions
};