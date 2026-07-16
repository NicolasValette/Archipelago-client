export interface Key {
    id: string;
    name: string;
}

export interface Trial {
    id: string;
    name: string;
    game: string;
    description: string;
    roomName: string;
    constraint: string;
}

export interface Room {
    id: string;
    name: string;
    constraint: string;
    game: string;
    trials: Trial[];
    //requiredKeys: Key[];
}