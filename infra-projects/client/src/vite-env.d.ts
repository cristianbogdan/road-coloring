/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_KEY_THUNDERFOREST: string
    readonly VITE_URL_PUM_API: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}

interface Location {
    updateQueryParams: () => void
}
interface Window {
    showLegendClicked: () => void;
    legendFilterClickHandler: (event: Event, element: HTMLElement) => void;
    location: {
        updateQueryParams: () => void
    };
}

// todo
// interface L {
//     Control: any
// }