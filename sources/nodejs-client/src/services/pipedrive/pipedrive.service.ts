import 'dotenv/config';

import fetch, { Response } from 'node-fetch';

import { PipedriveUser } from '../../models/pipedrive-user.model';

const fetcher = async <TEntity>(
    {
        method,
        endpoint,
        querystring,
        payload,
    }: {
        method: 'GET';
        endpoint: string;
        querystring?: string;
        payload?: Record<string, unknown>;
    },
    API_KEY: string
): Promise<TEntity | null> => {
    if (typeof payload === 'object' && Object.keys(payload).length === 0) {
        return Promise.resolve(null);
    }
    const requestOptions = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
        body:
            typeof payload === 'string' ||
            payload === undefined ||
            payload === null
                ? payload
                : JSON.stringify(payload),
    };

    const url = `https://api.pipedrive.com/v1/${endpoint}?api_token=${API_KEY}${
        querystring ? `&${querystring}` : ''
    }`;

    try {
        const httpResponse: Response = await fetch(url, requestOptions);
        const HTTP_OK = 200;
        const HTTP_OK_NO_CONTENT = 204;
        const HTTP_BAD_REQUEST = 400;
        const getEntity = async () => {
            const { data }: { data: TEntity } = await httpResponse.json();
            return data;
        };
        switch (httpResponse.status) {
            case HTTP_OK:
                return getEntity();
            case HTTP_OK_NO_CONTENT:
            case HTTP_BAD_REQUEST:
            default:
                return null;
        }
    } catch (error: any) {
        console.log('ERROR : ', error.message);
        return null;
    }
};

interface IPipedrive {
    findUserById(id: PipedriveUser['id']): Promise<PipedriveUser | null>;
}

export const Pipedrive = (API_KEY: string): IPipedrive => ({
    findUserById(id: PipedriveUser['id']): Promise<PipedriveUser | null> {
        if (!id || String(id).length === 0) {
            throw new Error('PipedriveService.getById(): id must be given');
        }
        return fetcher(
            {
                method: 'GET',
                endpoint: `users/${id}`,
            },
            API_KEY
        );
    },
});

// how-to
/*
(async (id: PipedriveUser['id'], API_KEY: string) => {
    const userFound = await Pipedrive(API_KEY).findUserById(id);    
})(14286808, (process.env as any).PIPEDRIVE_KEY);
*/
