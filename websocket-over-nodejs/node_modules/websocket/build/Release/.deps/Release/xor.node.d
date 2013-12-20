cmd_Release/xor.node := ln -f "Release/obj.target/xor.node" "Release/xor.node" 2>/dev/null || (rm -rf "Release/xor.node" && cp -af "Release/obj.target/xor.node" "Release/xor.node")
