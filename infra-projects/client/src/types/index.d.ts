export interface LotLimitProps {
    highway: string | null,
    name: string,
    osm_id: number,
    railway: string | null,
}

export interface RawProps {
    osm_id?: number,
    ref?: string,
    name?: string,
    railway?: string,
    highway?: string,
    construction?: string,
    proposed?: string,
    bridge?: string,
    tunnel?: string,
    status?: string,
    start_date?: string,
    opening_date?: string,
    access?: string,
    access_note?: string,
    start_date_note?: string
}

export interface Props extends RawProps {
    PTE?: boolean,
    AM?: boolean,
    AC?: boolean,
    severance?: string
    progress?: string[],    // data has only one element 
    signal_progress?: string[],   // data has only one element
    latestProgress?: number,
    latestSignalProgress?: number,
    tender?: string,
    hadStatus?: boolean,
    winner?: string,
    financing?: string,
    builder?: string,
    progress_estimate?: string[],   // data has only one element

    // verify where are these coming from
    comentarii_problema?: string,
    nume?: string,
    comentarii_rezolvare_curenta?: string,
    estimare_rezolvare?: string,
    link?: string,
    "construction:railway:etcs"?: string,
    ["railway:etcs"]?: string,

}