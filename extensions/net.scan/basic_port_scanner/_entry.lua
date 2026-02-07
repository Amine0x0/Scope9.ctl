local utils = require("utils")
local socket = require("socket")


local function init_table()
    local data = {}
    data.host = "127.0.0.1"
    data.start_port = 1
    data.end_port = 1024
    data.timeout = 0.2
    return data
end


local function init()
    print("Welcome to rec0n! v.0\n")
end


local function options()
    print("Select scan type:")
    print("1) Quick scan (1-1024)")
    print("2) Full scan (1-65535)")
    io.write("Choice: ")
    local choice = io.read("*l")
    local ops = init_table()

    if choice == "2" then
        ops.end_port = 65535
    elseif choice ~= "1" then
        print("Invalid choice, defaulting to quick scan.")
    end

    return ops
end


local function scan_port(host, port, timeout)
    local tcp = socket.tcp()
    tcp:settimeout(timeout)
    local ok, err = tcp:connect(host, port)
    if ok then
        local banner = utils.grab_banner(tcp)
        tcp:close()
        return true, banner
    end
    return false, nil
end


local function start_scan(ops)
    print("\nStarting scan on host:", ops.host)
    local open_ports = {}
    local sockets = {}
    local port = ops.start_port

    while port <= ops.end_port do

        for i = 1,100 do
            if port > ops.end_port then break end
            local tcp = socket.tcp()
            tcp:settimeout(0)
            tcp:connect(ops.host, port)
            sockets[#sockets+1] = {tcp=tcp, port=port}
            port = port + 1
        end


        local r, w = socket.select(nil, (function()
            local ws = {}
            for _,s in ipairs(sockets) do
                table.insert(ws, s.tcp)
            end
            return ws
        end)(), ops.timeout)

        for _,s in ipairs(sockets) do
            local ok = s.tcp:connect(ops.host, s.port)
            if ok then
                local banner = utils.grab_banner(s.tcp, s.port)
                if banner then
                    print(("Open port: %5d | Banner: %s"):format(s.port, banner:gsub("%s"," ")))
                else
                    print(("Open port: %5d"):format(s.port))
                end
                table.insert(open_ports, {port=s.port, banner=banner})
            end
            s.tcp:close()
        end
        sockets = {}
    end
    print("Scan completed.")
end

local function main()
    init()
    local ops = options()
    if not ops then
        error("Error initializing options")
        return 1
    end
    start_scan(ops)
end

main()
