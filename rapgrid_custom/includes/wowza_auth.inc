<?php



// AUTH


class Akamai_EdgeAuth_ParameterException extends Exception {
}
class Akamai_EdgeAuth_Config {
    protected $algo = "SHA256";
    protected $ip = '';
    protected $start_time = 0;
    protected $window = 300;
    protected $acl = '';
    protected $url = '';
    protected $session_id = '';
    protected $data = '';
    protected $salt = '';
    protected $key = '';
    protected $field_delimiter = '~';
    protected $early_url_encoding = false;


    protected function encode($val) {
        if ($this->early_url_encoding === true) {
            return rawurlencode($val);
        }
        return $val;
    }

    public function set_algo($algo) {
        if (in_array($algo, array('sha256','sha1','md5'))) {
            $this->algo = $algo;
        } else {
            throw new Akamai_EdgeAuth_ParameterException("Invalid algorithme, must be one of 'sha256', 'sha1' or 'md5'");
        }
    }
    public function get_algo() {return $this->algo;}

    public function set_ip($ip) {
        // @TODO: Validate IPV4 & IPV6 addrs
        $this->ip = $ip;
    }
    public function get_ip() {return $this->ip;}
    public function get_ip_field() {
        if ( $this->ip != "" ) {
            return 'ip='.$this->ip.$this->field_delimiter;
        }
        return "";
    }

    public function set_start_time($start_time) {
        // verify starttime is sane
        if ( strcasecmp($start_time, "now") == 0 ) {
            $this->start_time = time();
        } else {
            if ( is_numeric($start_time) && $start_time > 0 && $start_time < 4294967295 ) {
                $this->start_time = 0+$start_time; // faster then intval
            } else {
                throw new Akamai_EdgeAuth_ParameterException("start time input invalid or out of range");
            }
        }
    }
    public function get_start_time() {return $this->start_time;}
    protected function get_start_time_value() {
        if ( $this->start_time > 0 ) {
            return $this->start_time;
        } else {
            return time();
        }
    }
    public function get_start_time_field() {
        if ( is_numeric($this->start_time) && $this->start_time > 0 && $this->start_time < 4294967295 ) {
            return 'st='.$this->get_start_time_value().$this->field_delimiter;
        } else {
            return '';
        }
    }

    public function set_window($window) {
        // verify window is sane
        if ( is_numeric($window) && $window > 0 ) {
            $this->window = 0+$window; // faster then intval
        } else {
            throw new Akamai_EdgeAuth_ParameterException("window input invalid");
        }
    }
    public function get_window() {return $this->window;}
    public function get_expr_field() {
        return 'exp='.($this->get_start_time_value()+$this->window).$this->field_delimiter;
    }

    public function set_acl($acl) {
        if ($this->url != "") {
            throw new Akamai_EdgeAuth_ParameterException("Cannot set both an ACL and a URL at the same time");
        }
        $this->acl = $acl;
    }
    public function get_acl() {return $this->acl;}
    public function get_acl_field() {
        if ($this->acl) {
            return 'acl='.$this->encode($this->acl).$this->field_delimiter;
        } elseif (! $this->url) {
            //return a default open acl
            return 'acl='.$this->encode('/*').$this->field_delimiter;
        }
        return '';
    }

    public function set_url($url) {
        if ($this->acl) {
            throw new Akamai_EdgeAuth_ParameterException("Cannot set both an ACL and a URL at the same time");
        }
        $this->url = $url;
    }
    public function get_url() {return $this->url;}
    public function get_url_field() {
        if ($this->url && ! $this->acl) {
            return 'url='.$this->encode($this->url).$this->field_delimiter;
        }
        return '';
    }

    public function set_session_id($session_id) {$this->session_id = $session_id;}
    public function get_session_id() {return $this->session_id;}
    public function get_session_id_field() {
        if ($this->session_id) {
            return 'id='.$this->session_id.$this->field_delimiter;
        }
        return "";
    }

    public function set_data($data) {$this->data = $data;}
    public function get_data() {return $this->data;}
    public function get_data_field() {
        if ($this->data) {
            return 'data='.$this->data.$this->field_delimiter;
        }
        return "";
    }

    public function set_salt($salt) {$this->salt = $salt;}
    public function get_salt() {return $this->salt;}
    public function get_salt_field() {
        if ($this->salt) {
            return 'salt='.$this->salt.$this->field_delimiter;
        }
        return "";
    }

    public function set_key($key) {
        //verify the key is valid hex
        if (preg_match('/^[a-fA-F0-9]+$/',$key) && (strlen($key)%2) == 0) {
            $this->key = $key;
        } else {
            throw new Akamai_EdgeAuth_ParameterException("Key must be a hex string (a-f,0-9 and even number of chars)");
        }
    }
    public function get_key() {return $this->key;}

    public function set_field_delimiter($field_delimiter) {$this->field_delimiter = $field_delimiter;}
    public function get_field_delimiter() {return $this->field_delimiter;}

    public function set_early_url_encoding($early_url_encoding) {$this->early_url_encoding = $early_url_encoding;}
    public function get_early_url_encoding() {return $this->early_url_encoding;}
}

class Akamai_EdgeAuth_Generate {

    protected function h2b($str) {
        $bin = "";
        $i = 0;
        do {
            $bin .= chr(hexdec($str{$i}.$str{($i + 1)}));
            $i += 2;
        } while ($i < strlen($str));
        return $bin;
    }

    public function generate_token($config) {
        // ASSUMES:($algo='sha256', $ip='', $start_time=null, $window=300, $acl=null, $acl_url="", $session_id="", $payload="", $salt="", $key="000000000000", $field_delimiter="~")
        $m_token = $config->get_ip_field();
        $m_token .= $config->get_start_time_field();
        $m_token .= $config->get_expr_field();
        $m_token .= $config->get_acl_field();
        $m_token .= $config->get_session_id_field();
        $m_token .= $config->get_data_field();
        $m_token_digest = (string)$m_token;
        $m_token_digest .= $config->get_url_field();
        $m_token_digest .= $config->get_salt_field();

        // produce the signature and append to the tokenized string
        $signature = hash_hmac($config->get_algo(), rtrim($m_token_digest, $config->get_field_delimiter()), $this->h2b($config->get_key()));
        return $m_token.'hmac='.$signature;
    }
}

// Retrieve Token and send back to page content
function rapgrid_playback_token($nid){
    global $user;
    $token = '';
    $node = node_load($nid);
    if($node->field_liveppv_key[0]['value']){
        if (node_access("view", $node, $user)){
            // User has access, generate and return $token_get_all
            $node->field_liveppv_key[0]['value'];
            $c = new Akamai_EdgeAuth_Config();
            $c->set_key($node->field_liveppv_key[0]['value']);
            $g = new Akamai_EdgeAuth_Generate();
            $token = $g->generate_token($c);
            $token = "?hdnts=" . $token;
        }
    }
    echo $node->field_liveppv_url[0]['value'] . $token;
}