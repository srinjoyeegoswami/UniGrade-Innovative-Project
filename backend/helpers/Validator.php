<?php
class Validator {

    private array $errors = [];
    private array $data   = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    // ----------------------------------------------------------------
    // Factory
    // ----------------------------------------------------------------

    public static function make(array $data, array $rules): self {
        $instance = new self($data);
        $instance->validate($rules);
        return $instance;
    }

    // ----------------------------------------------------------------
    // Fluent validation API
    // ----------------------------------------------------------------

    public function required(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val === null || $val === '' || (is_array($val) && empty($val))) {
            $this->addError($field, $message ?? "The {$field} field is required.");
        }
        return $this;
    }

    public function email(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && $val !== '' && !filter_var($val, FILTER_VALIDATE_EMAIL)) {
            $this->addError($field, $message ?? "The {$field} must be a valid email address.");
        }
        return $this;
    }

    public function string(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && !is_string($val)) {
            $this->addError($field, $message ?? "The {$field} must be a string.");
        }
        return $this;
    }

    public function integer(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && $val !== '' && !filter_var($val, FILTER_VALIDATE_INT)) {
            $this->addError($field, $message ?? "The {$field} must be an integer.");
        }
        return $this;
    }

    public function numeric(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && $val !== '' && !is_numeric($val)) {
            $this->addError($field, $message ?? "The {$field} must be numeric.");
        }
        return $this;
    }

    public function min(string $field, float|int $min, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && is_numeric($val) && (float)$val < (float)$min) {
            $this->addError($field, $message ?? "The {$field} must be at least {$min}.");
        } elseif ($val !== null && is_string($val) && strlen($val) < (int)$min) {
            $this->addError($field, $message ?? "The {$field} must be at least {$min} characters.");
        }
        return $this;
    }

    public function minLength(string $field, int $min, ?string $message = null): self {
        return $this->min($field, $min, $message);
    }

    public function max(string $field, float|int $max, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && is_numeric($val) && (float)$val > (float)$max) {
            $this->addError($field, $message ?? "The {$field} must not exceed {$max}.");
        } elseif ($val !== null && is_string($val) && strlen($val) > (int)$max) {
            $this->addError($field, $message ?? "The {$field} must not exceed {$max} characters.");
        }
        return $this;
    }

    public function maxLength(string $field, int $max, ?string $message = null): self {
        return $this->max($field, $max, $message);
    }

    public function in(string $field, array $allowed, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && !in_array($val, $allowed, true)) {
            $this->addError($field, $message ?? "The {$field} must be one of: " . implode(', ', $allowed) . '.');
        }
        return $this;
    }

    public function date(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null && $val !== '') {
            $d = \DateTime::createFromFormat('Y-m-d', $val);
            if (!$d || $d->format('Y-m-d') !== $val) {
                $this->addError($field, $message ?? "The {$field} must be a valid date (YYYY-MM-DD).");
            }
        }
        return $this;
    }

    public function password(string $field, ?string $message = null): self {
        $val = $this->data[$field] ?? null;
        if ($val !== null) {
            if (strlen($val) < 8) {
                $this->addError($field, $message ?? "The {$field} must be at least 8 characters.");
            }
            if (!preg_match('/[A-Z]/', $val)) {
                $this->addError($field, $message ?? "The {$field} must contain at least one uppercase letter.");
            }
            if (!preg_match('/[a-z]/', $val)) {
                $this->addError($field, $message ?? "The {$field} must contain at least one lowercase letter.");
            }
            if (!preg_match('/\d/', $val)) {
                $this->addError($field, $message ?? "The {$field} must contain at least one number.");
            }
            if (!preg_match('/[\W_]/', $val)) {
                $this->addError($field, $message ?? "The {$field} must contain at least one special character.");
            }
        }
        return $this;
    }

    public function nullable(string $field): self {
        return $this;
    }

    // ----------------------------------------------------------------
    // Rule string engine (e.g. 'required|email|min:3')
    // ----------------------------------------------------------------

    public function validate(array $rules): void {
        foreach ($rules as $field => $ruleString) {
            $fieldRules = explode('|', $ruleString);
            $value      = $this->data[$field] ?? null;

            foreach ($fieldRules as $rule) {
                [$ruleName, $ruleParam] = array_pad(explode(':', $rule, 2), 2, null);

                switch (trim($ruleName)) {
                    case 'required':
                        $this->required($field);
                        break;
                    case 'string':
                        $this->string($field);
                        break;
                    case 'integer':
                    case 'int':
                        $this->integer($field);
                        break;
                    case 'numeric':
                        $this->numeric($field);
                        break;
                    case 'email':
                        $this->email($field);
                        break;
                    case 'min':
                        $this->min($field, (float)$ruleParam);
                        break;
                    case 'max':
                        $this->max($field, (float)$ruleParam);
                        break;
                    case 'in':
                        $this->in($field, explode(',', $ruleParam ?? ''));
                        break;
                    case 'date':
                        $this->date($field);
                        break;
                    case 'password':
                        $this->password($field);
                        break;
                    case 'nullable':
                        if ($value === null || $value === '') {
                            break 2;
                        }
                        break;
                }
            }
        }
    }

    // ----------------------------------------------------------------
    // Results
    // ----------------------------------------------------------------

    public function passes(): bool {
        return empty($this->errors);
    }

    public function fails(): bool {
        return !$this->passes();
    }

    public function errors(): array {
        return $this->errors;
    }

    public function firstError(): string {
        foreach ($this->errors as $messages) {
            return $messages[0] ?? '';
        }
        return '';
    }

    public function getData(): array {
        return $this->data;
    }

    // ----------------------------------------------------------------
    // Helpers
    // ----------------------------------------------------------------

    private function addError(string $field, string $message): void {
        $this->errors[$field][] = $message;
    }

    public static function sanitize(string $value): string {
        return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
    }

    public static function only(array $data, array $keys): array {
        return array_intersect_key($data, array_flip($keys));
    }

    public static function jsonBody(): array {
        $raw = file_get_contents('php://input');
        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }
}
