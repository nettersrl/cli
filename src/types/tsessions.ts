export type VideoType = "none" | "internal2D" | "internal3D" | "dedicatedGpu";

export interface IVideo {
    video_type: VideoType;
    screens_number?: number;
    screens_resolution?: string;
    frame_rate?: 15 | 30 | 60;
}

export interface INetworkPort {
    mac_address: string;
    network_port_profile: string;
    networkIndex: number;
}

export interface IPciExpressResource {
    dedicated_pci_resource_id: string;
    mode: "reserved" | "best_effort";
}

export interface ICpu {
    vcpu_cores: number;
    vcpu_min_reservation: number;
    vcpu_max_reservation: number;
    vcpu_weight: number;
}

export interface IRam {
    fixed_ram: number;
    dynamic_ram_min: number;
    dynamic_ram_max: number;
    memory_weight: number;
}

export interface IDisk {
    name: string;
    size: number;
    type: string;
    tier: string;
    storage_qos_policy: string;
    diskIndex: number;
}

export interface ICreateSessionBody {
    is_shielded: boolean,
    name: string,
    enterpriseId: string,
    type: "desktop" | "server",
    dns_name: string,
    virt_managerId: string,
    hostgroupId: string,
    templateId: string,
    domain: string,
    local_admin_password: string,
    automatic_network: boolean
}

export interface ISessionMetadata {
    id: string;
    vmmId: string;
    name: string;
    enterpriseId: string;
    ltree_path: string;
    userId: string;
    type: "desktop" | "server";
    is_shielded: boolean;
    hostgroupId: string;
    virt_managerId: string;
    hypervisor: string;
    vcpu: ICpu;
    ram: IRam;
    video: IVideo;
    disks: IDisk[];
    dedicated_pci_resources: IPciExpressResource[];
    networks: INetworkPort[];
}

export type SessionStatus = "on" | "off" | "unmanaged"

export interface ISessionSession {
    id?: string;
    vmmId: string;
    hypervisor: string;
    type: string;
    status: SessionStatus;
    is_shielded?: boolean;
    name: string;
    dns_name?: string;
    enterpriseId: string;
    userId?: string;
    virt_managerId: string;
    templateId: string;
    domain?: string;
    ltree_path: string;
    automatic_network?: boolean;
};

export interface IEditSessionBody {
    id: string;
    vmmId: string;
    name: string;
    enterpriseId: string;
    ltree_path: string;
    userId?: string;
    type: "desktop" | "server";
    is_shielded: boolean;
    hostgroupId: string;
    virt_managerId: string;
    hypervisor: string;
    vcpu: ICpu;
    ram: IRam;
    video: IVideo;
    disks: IDisk[];
    dedicated_pci_resources: IPciExpressResource[];
    networks: INetworkPort[];
    shouldBeBootstrappedAtNextBoot: false;
    runSpecificBootstrapFunctions: [];
}

export interface ISessionReply {
    jobId: string;
    sessionId: string;
    exit_code: string;
    operation: string; 
    description: string;
}

export interface IGenericReply { 
    status: number;
    statusText: string;
}

export interface IGetAllReply<T> { 
    status: number;
    statusText: string;
    body: T[]
}

export interface IGetSingleReply<T> { 
    status: number;
    statusText: string;
    body: T
}

export interface IFilterBodyParam {
    id?: string;
    vmmId?: string;
    status?: string;
    enterpriseId?: string;
    templateId?: string;
    domain?: string;
    name?: string;
    dns_name?: string;
}