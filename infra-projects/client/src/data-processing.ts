import type { Props } from "./types";

export function computeStatus(props: Props) {
    if (!props.status) return;
    for (const prop of props.status.split(',')) {
        const [prop_key, prop_value] = prop.split(':');

        // props[prop_key] = prop_value;
        if (prop_key == 'progress') {
            props.progress = prop_value.split(' ');
            props.latestProgress = parseFloat(props.progress[0].split('%')[0]);
        } else if (prop_key == 'progress_estimate') {
            props.progress_estimate = prop_value.split(' ');
            props.latestProgress = parseFloat(props.progress_estimate[0].split('%')[0]);
        } else if (prop_key == 'signal_progress') {
            props.signal_progress = prop_value.split(' ');
            props.latestSignalProgress = parseFloat(props.signal_progress[0].split('%')[0]);
        } else if (prop_key == 'tender') {
            props.tender = prop_value;
        } else if (prop_key == 'builder') {
            props.builder = prop_value;
        } else if (prop_key == 'severance') {
            props.severance = prop_value;
        } else if (prop_key == 'financing') {
            // TODO: this is misspelled with 73 times
            props.financing = prop_value;
        } else if (prop_key == 'winner') {
            props.winner = prop_value;
        } else if (prop_key == 'PTE') {
            props.PTE = true;
        } else if (prop_key == 'AM') {
            props.AM = true;
        } else if (prop_key == 'AC') {
            props.AC = true;
        } else {
            // console.warn('Unknown feature status key: ' + prop_key);
        }
    };
    props.hadStatus = true;
    props.status = undefined;
};