
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class Partner {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export abstract class IQuery {
    abstract getPartner(id: string): Nullable<Partner> | Promise<Nullable<Partner>>;

    abstract getAllPartners(): Partner[] | Promise<Partner[]>;
}

export abstract class IMutation {
    abstract createPartner(name: string, description: string): Partner | Promise<Partner>;

    abstract updatePartner(id: string, name: string, description: string): Partner | Promise<Partner>;

    abstract deletePartner(id: string): Partner | Promise<Partner>;
}

export type DateTime = any;
type Nullable<T> = T | null;
