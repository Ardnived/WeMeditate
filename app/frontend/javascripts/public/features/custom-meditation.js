import zenscroll from 'zenscroll'

export default class CustomMeditation {

  constructor(element) {
    this.container = element
    this.form = element.querySelector('.meditations__custom__form')
    this.goalSection = element.querySelector('.meditations__custom__goal')
    this.goalDropdown = this.goalSection.querySelector('.meditations__custom__goal__input')
    this.goalInput = this.goalDropdown.querySelector('input')
    this.durationSection = element.querySelector('.meditations__custom__duration')
    this.durationRadioGroup = this.durationSection.querySelector('.radio_group')
    this.durationButtons = this.durationRadioGroup.querySelectorAll('input[type="radio"]')

    for (let index = 0; index < this.durationButtons.length; index++) {
      this.durationButtons[index].addEventListener('click', event => this._onDurationChange(event))
    }

    this.goalDropdown.addEventListener('change', event => this._onGoalChange(event))
    this.form.addEventListener('submit', event => this._onSubmit(event))
  }

  _onGoalChange(_event) {
    this.goalDropdown.classList.remove('dropdown--error')

    if (window.innerWidth < 768) {
      zenscroll.center(this.durationSection)
    }
  }

  _onDurationChange(event) {
    event.currentTarget.classList.add('test-checked')
    this.durationRadioGroup.classList.remove('radio_group--error')
  }

  _onSubmit(event) {
    let errorSection = null
    let hasDurationValue = false

    for (let index = 0; index < this.durationButtons.length; index++) {
      hasDurationValue = hasDurationValue || this.durationButtons[index].checked
    }

    if (!hasDurationValue) {
      this.durationRadioGroup.classList.add('radio_group--error')
      errorSection = this.durationSection
    }
    
    let hasGoalValue = Boolean(this.goalInput.value)
    if (!hasGoalValue) {
      this.goalDropdown.classList.add('dropdown--error')
      errorSection = this.goalSection
    }
    
    if (errorSection) {
      event.preventDefault()
      event.stopPropagation()

      if (window.innerWidth >= 768) {
        zenscroll.to(this.container)
      } else {
        zenscroll.to(errorSection)
      }
    }
  }

}
