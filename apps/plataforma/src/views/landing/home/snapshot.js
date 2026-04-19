const pricingState = {
  monthly: {
    price: 'R$197/mês',
    meta: 'Pago mensalmente',
  },
  annual: {
    price: 'R$157/mês',
    meta: 'Cobrado anualmente · economize 20%',
  },
}

const toggleRoot = document.querySelector('[data-pricing-toggle]')
const priceEl = document.querySelector('[data-price]')
const priceMetaEl = document.querySelector('[data-price-meta]')

if (toggleRoot && priceEl && priceMetaEl) {
  toggleRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-cycle]')
    if (!button) return

    const cycle = button.getAttribute('data-cycle')
    if (!cycle || !pricingState[cycle]) return

    toggleRoot.querySelectorAll('[data-cycle]').forEach((item) => {
      item.classList.toggle('is-active', item === button)
    })

    priceEl.textContent = pricingState[cycle].price
    priceMetaEl.textContent = pricingState[cycle].meta
  })
}

document.querySelectorAll('.lp-faq-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.lp-faq-item')
    if (!item) return

    const root = item.parentElement
    root?.querySelectorAll('.lp-faq-item').forEach((entry) => {
      entry.classList.toggle('is-open', entry === item)
    })
  })
})
