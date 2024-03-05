const enpoints = [
    {
        method: "GET",
        path: "/v1",
        description: "Returns the list of enpoints (this list)"
    },
    {
        method: "GET",
        path: "/v1/changelog",
        description: "Returns the Droptop Four changelog"
    },
    {
        method: "GET",
        path: "/v1/changelog/[version]",
        description: "Returns the Droptop Four changelog for the [version] version"
    },
    {
        method: "GET",
        path: "/v1/community-apps",
        description: "Returns the list of all Droptop Four community apps"
    },
    {
        method: "GET",
        path: "/v1/community-apps/[id]",
        description: "Returns the Droptop Four community app with the [id] id"
    },
    {
        method: "GET",
        path: "/v1/community-apps/id/[id]",
        description: "Returns the Droptop Four community app with the [id] id"
    },
    {
        method: "GET",
        path: "/v1/community-apps/name/[name]",
        description: "Returns the Droptop Four community app with the [name] name"
    },
    {
        method: "GET",
        path: "/v1/community-apps/uuid/[uuid]",
        description: "Returns the Droptop Four community app with the [uuid] uuid"
    },
    {
        method: "GET",
        path: "/v1/community-themes",
        description: "Returns the list of all Droptop Four community themes"
    },
    {
        method: "GET",
        path: "/v1/community-themes/[id]",
        description: "Returns the Droptop Four community theme with the [id] id"
    },
    {
        method: "GET",
        path: "/v1/community-themes/id/[id]",
        description: "Returns the Droptop Four community theme with the [id] id"
    },
    {
        method: "GET",
        path: "/v1/community-themes/name/[name]",
        description: "Returns the Droptop Four community theme with the [name] name"
    },
    {
        method: "GET",
        path: "/v1/community-themes/uuid/[uuid]",
        description: "Returns the Droptop Four community theme with the [uuid] uuid"
    },
    {
        method: "GET",
        path: "v1/downloads",
        description: "Returns the number of downloads of Droptop Four"
    },
    {
        method: "GET",
        path: "v1/downlaods/community-apps/[uuid]",
        description: "Returns the number of downloads of the Droptop Four community app with the [uuid] uuid"
    },
    {
        method: "POST",
        path: "v1/downlaods/community-apps/[uuid]",
        description: "Adds one to the number of downlaods of the Droptop Four community app with the [uuid] uuid"
    },
    {
        method: "GET",
        path: "v1/downlaods/community-themes/[uuid]",
        description: "Returns the number of downloads of the Droptop Four community theme with the [uuid] uuid"
    },
    {
        method: "POST",
        path: "v1/downlaods/community-themes/[uuid]",
        description: "Adds one to the number of downlaods of the Droptop Four community theme with the [uuid] uuid"
    },
    {
        method: "GET",
        path: "/v1/ping",
        description: "Returns a simple ping response"
    },
    {
        method: "GET",
        path: "/v1/version",
        description: "Returns the version of the API"
    },
];

export default enpoints