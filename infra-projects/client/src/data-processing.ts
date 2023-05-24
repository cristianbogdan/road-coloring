import { Props } from "./road-style";

export function computeStatus(props: Props) {
    if (!props.status) return;
    for (const prop of props.status.split(',')) {
        const [prop_key, prop_value] = prop.split(':');
        if (prop_value) {
            props[prop_key] = prop_value;
            if (prop_key == 'progress') {
                props.progress = prop_value.split(' ');
                props.latestProgress = parseFloat(props.progress[0].split('%')[0]);
            } else if (prop_key == 'progress_estimate') {
                props.progress_estimate = prop_value.split(' ');
                props.latestProgress = parseFloat(props.progress_estimate[0].split('%')[0]);
            } else if (prop_key == 'signal_progress') {
                props.signal_progress = prop_value.split(' ');
                props.latestSignalProgress = parseFloat(props.signal_progress[0].split('%')[0]);
            }
        } else {
            // PTE, AM, AC    
            props[prop_key] = true;
        }
    };
    //if(p.progress_estimate)
    //p.latestProgress=parseFloat(p.progress_estimate.split('%')[0]);
    props.hadStatus = true;
    props.status = null;
};