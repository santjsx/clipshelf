use regex::Regex;
use std::sync::LazyLock;

static PROCESS_DENYLIST: &[&str] = &[
    "bitwarden.exe",
    "1password.exe",
    "keepass.exe",
    "keepassxc.exe",
    "dashlane.exe",
    "enpass.exe",
    "roboform.exe",
    "lastpass.exe",
];

// Regexes for common secret patterns
static API_KEY_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?i)(sk-[a-zA-Z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36}|eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)").unwrap()
});

static ENV_SECRET_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?im)^(AWS_SECRET_ACCESS_KEY|DATABASE_URL|MYSQL_PASSWORD|POSTGRES_PASSWORD|SECRET_KEY|API_SECRET|PRIVATE_KEY)\s*=\s*\S+").unwrap()
});

static DIGIT_CANDIDATE_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"\b(?:\d[ -]*?){13,19}\b").unwrap()
});

/// Check if the source process name matches a known password manager
pub fn is_blocked_process(process_name: &str) -> bool {
    let lower_name = process_name.to_lowercase();
    PROCESS_DENYLIST.iter().any(|&blocked| lower_name.ends_with(blocked))
}

/// Standard Luhn algorithm check for credit card numbers
pub fn luhn_check(number_str: &str) -> bool {
    let digits: Vec<u32> = number_str
        .chars()
        .filter(|c| c.is_ascii_digit())
        .filter_map(|c| c.to_digit(10))
        .collect();

    if digits.len() < 10 || digits.len() > 19 {
        return false;
    }

    let mut sum = 0;
    let mut alternate = false;

    for &digit in digits.iter().rev() {
        let mut d = digit;
        if alternate {
            d *= 2;
            if d > 9 {
                d -= 9;
            }
        }
        sum += d;
        alternate = !alternate;
    }

    sum % 10 == 0
}

/// Check if raw text content contains sensitive data (credit card, API keys, secrets)
pub fn contains_sensitive_data(text: &str) -> bool {
    // 1. Check API Key patterns
    if API_KEY_REGEX.is_match(text) {
        log::warn!("Sensitive filter blocked clip matching API key pattern.");
        return true;
    }

    // 2. Check .env secret key patterns
    if ENV_SECRET_REGEX.is_match(text) {
        log::warn!("Sensitive filter blocked clip matching environment secret pattern.");
        return true;
    }

    // 3. Check for potential Credit Card numbers using Luhn algorithm
    for mat in DIGIT_CANDIDATE_REGEX.find_iter(text) {
        if luhn_check(mat.as_str()) {
            log::warn!("Sensitive filter blocked clip containing valid credit card number.");
            return true;
        }
    }

    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_blocked_process() {
        assert!(is_blocked_process("Bitwarden.exe"));
        assert!(is_blocked_process("C:\\Program Files\\1Password\\1Password.exe"));
        assert!(!is_blocked_process("chrome.exe"));
        assert!(!is_blocked_process("Code.exe"));
    }

    #[test]
    fn test_luhn_check() {
        // Standard test card numbers (Luhn valid)
        assert!(luhn_check("49927398716"));
        assert!(luhn_check("4992 7398 716"));
        assert!(!luhn_check("49927398717")); // Invalid checksum
    }

    #[test]
    fn test_sensitive_data() {
        assert!(contains_sensitive_data("AKIAIOSFODNN7EXAMPLE"));
        assert!(contains_sensitive_data("AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"));
        assert!(!contains_sensitive_data("const hello = 'world';"));
    }
}
