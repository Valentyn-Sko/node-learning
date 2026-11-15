export function chechIsCorrectId (value: string) {
    if (!Number.isInteger(value) || +value <= 0) {
        throw Error('ID должен быть целым положительным числом');
    }
}

export function chechIsText (value: string) {
    if (!value || !value.length) {
        throw Error('текст не может быть пустым');
        
    }
}