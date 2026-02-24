const fs = document.querySelector('.fsb')
const area = document.querySelector('textarea')
const form = document.querySelector('form')
const copyBtn = document.querySelector('.copy')
const themeSwitch = document.querySelector('.darklight')
const deleteBtn = document.querySelector('.delete')
const cancelBtn = document.querySelector('.cancel')
const deleteForm = document.querySelector('.delete-form')
themeSwitch.addEventListener('click', () => {
    document.body.classList.toggle('light')
})

form.addEventListener('submit', (evt) => {

})

fs.addEventListener('click', () => {
    area.classList.toggle('fs')
})
copyBtn.addEventListener('click', () => {
    copyText()
})
function copyText() {
    const text = document.querySelector("textarea");
    text.select();
    text.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(text.value);
}

deleteBtn.addEventListener('click', () => {
    deleteForm.classList.toggle("show")
})

cancelBtn.addEventListener('click', () => {
    deleteForm.classList.toggle("show")
})
