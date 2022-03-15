export interface PipedriveUser {
    id: number;
    name: string;
    default_currency: string;
    timezone_name: string;
    timezone_offset: string;
    locale: string;
    email: string;
    phone: string;
    created: string;
    modified: string;
    lang: number;
    active_flag: boolean;
    is_admin: number;
    last_login: string;
    signup_flow_variation: string;
    role_id: number;
    has_created_company: boolean;
    icon_url?: any;
    is_you: boolean;
}
