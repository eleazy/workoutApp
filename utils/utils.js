import { StyleSheet } from 'react-native'

export const colors = [
    {
        heart_color: '#cf0e00',//red
        styleTextColor: '#b81206',
        styleTextColorWeak: '#b51105',
    },
    {
        heart_color: '#c902db',//purple
        styleTextColor: '#ad04bd',
        styleTextColorWeak: '#b804c9',
    },
    {
        heart_color: '#ab115e', //pink
        styleTextColor: '#bf2c76',
        styleTextColorWeak: '#d93f8c',
    },
    {
        heart_color: '#875239',//brown
        styleTextColor: '#804930',
        styleTextColorWeak: '#8c5034',
    },

    {
        heart_color: '#0d8f61',//green
        styleTextColor: '#278766',
        styleTextColorWeak: '#3ba37f',
    },
    {
        heart_color: '#2b73ab',//blue
        styleTextColor: '#066cba',
        styleTextColorWeak: '#0673c7',
    },
]

export const handleSelection = (selectedItem, stateArray, stateSetter) => {
    if (stateArray.includes(selectedItem)) {
        stateSetter(stateArray.filter((item) => item !== selectedItem))
    } else {
        stateSetter([...stateArray, selectedItem])
    }
}

export const styles = StyleSheet.create({
    textWeakColor: {
        color: "#b3b3b3"
    },
    textStrongColor: { color: "#fafafa" },
    borderColor: { borderColor: "#8c8c8c" },
    container: {
        width: '100%',
        margin: 0,
    },
});

export function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return [formattedHours, formattedMinutes, formattedSeconds]// `${formattedHours}${formattedMinutes}${formattedSeconds}`;
}

export const plainSearchText = (str) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ /g, "");


