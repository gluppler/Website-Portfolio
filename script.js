document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash) {
        const section = window.location.hash.substring(1);
        openNotepad(section);
    }
});

function openNotepad(section) {
    const notepad = document.getElementById("notepad");
    const notepadTitle = document.getElementById("notepad-title");
    const notepadContent = document.getElementById("notepad-content");

    let title = "";
    let content = "<h2>Select a category from desktop icons</h2>";

    switch(section) {
        case "whoami":
            title = "whoami";
            content = `
                <h2>Cyber Security Researcher</h2>
                <p>>_ Specializing in malware analysis and reverse engineering</p>
                <div class="bio">
                    <p>[+] 0 years experience in offensive security</p>
                    <p>[+] Test</p>
                    <p>[+] CTF player & vulnerability researcher</p>
                    <p>[+] Test</p>
                </div>
                <h2>Core Expertise</h2>
                <ul>
                    <li>Malware Analysis & Reverse Engineering</li>
                    <li>Binary Exploitation (Linux/Windows)</li>
                    <li>Custom Tool Development</li>
                    <li>Threat Intelligence Research</li>
                </ul>
            `;
            break;

        case "projects":
            title = "Projects";
            content = `
                <h2>Notable Projects</h2>
                <div class="project">
                    <h3>Malware Analysis Toolkit (MAT)</h3>
                    <p>Open-source framework for automated malware analysis</p>
                    <p>Tech: Python, C++, YARA, Volatility</p>
                </div>
                <div class="project">
                    <h3>ROPchain Generator</h3>
                    <p>Automatic ROP chain development for binary exploitation</p>
                    <p>Tech: Python, Angr, Z3 Solver</p>
                </div>
                <div class="project">
                    <h3>UnpackerX</h3>
                    <p>Universal unpacker for common malware packers</p>
                    <p>Tech: C++, x86/64 Assembly, PE/ELF parsers</p>
                </div>
            `;
            break;

        case "skills":
            title = "Skills";
            content = `
                <h2>Technical Arsenal</h2>
                <ul>
                    <li>Static/Dynamic Analysis (IDA Pro, Ghidra, x64dbg)</li>
                    <li>Exploit Development (ROP, Heap Spray, Kernel)</li>
                    <li>Fuzzing & Vulnerability Research (AFL++, libFuzzer)</li>
                    <li>Programming: Python/C/C++/Rust/ASM</li>
                    <li>Threat Hunting & IOC Creation</li>
                </ul>
            `;
            break;

        case "tools":
            title = "Tools";
            content = `
                <h2>Custom Tool Development</h2>
                <div class="tool">
                    <h3>DynAnalyzer</h3>
                    <p>Sandbox for dynamic malware analysis</p>
                    <p>Features: API hooking, network simulation, evasion detection</p>
                </div>
                <div class="tool">
                    <h3>ShellcodeFactory</h3>
                    <p>Automated shellcode generation and testing framework</p>
                </div>
                <div class="tool">
                    <h3>PEMangler</h3>
                    <p>PE header obfuscation for red team operations</p>
                </div>
            `;
            break;

        case "certs":
            title = "Certifications";
            content = `
                <h2>Credentials</h2>
                <ul>
                    <li>SAL1 (Hopefully soon)</li>
                    <li>CDSA (Hopefully soon)</li>
                    <li>None</li>
                    <li>None</li>
                </ul>
            `;
            break;

        case "contact":
            title = "Contact";
            content = `
                <h2>Connect with Me</h2>
                <p>Email: researcher@cybersec.portfolio</p>
                <p>GitHub: github.com/cyber-researcher</p>
                <p>LinkedIn: linkedin.com/in/cyber-researcher</p>
                <p>PGP Key: <a href="#pgp">0xDEADBEEF</a></p>
            `;
            break;
    }

    notepadTitle.textContent = title;
    notepadContent.innerHTML = content;
    notepad.classList.remove("hidden");
    window.location.hash = section;
}

function closeNotepad() {
    document.getElementById("notepad").classList.add("hidden");
    window.location.href = window.location.pathname;
}
