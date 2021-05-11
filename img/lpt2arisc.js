function lpt2arisc()
{
    var i = 0;
    var gpio_done = 0, stepgen_done = 0;
    var src = document.querySelector("#source");
    var s = src.innerText;
    var out = document.querySelector("#output");
    var notes_en = document.querySelector("#conv_notes_en");
    var pins = [
        // main GPIO socket
        'PA12','PA11','PA6','PA13','PA14','PA1','PD14','PA0','PA3','PC4','PC7',
        'PC0','PC1','PA2','PC2','PC3','PA21','PA19','PA18','PA7','PA8','PG8',
        'PA9','PA10','PG9','PA20','PG6','PG7',
        // camera (CSI) GPIO socket
        'PE13','PE12','PE15','PE3','PE2','PE11','PE1','PE10','PE9','PE0','PE8',
        'PE4','PE7','PE5','PE6' ];

    var in_all = src.innerText.match(/parport\.[0-9]+\.pin\-[0-9]+\-in/g);
    var out_all = src.innerText.match(/parport\.[0-9]+\.pin\-[0-9]+\-out/g);
    if ( out_all == null || typeof(out_all) != "object" || typeof(out_all.length) != "number" ) out_all = [];
    if ( in_all == null || typeof(in_all) != "object" || typeof(in_all.length) != "number" ) in_all = [];

    var in_uniq = [], out_uniq = [];
    for ( i = out_all.length; i--; )
    {
        if ( !out_uniq.includes(out_all[i]) ) out_uniq.push(out_all[i]);
    }
    for ( i = in_all.length; i--; )
    {
        if ( !in_uniq.includes(in_all[i]) ) in_uniq.push(in_all[i]);
    }

    var total_cnt = in_uniq.length + out_uniq.length;
    if ( total_cnt > pins.length )
    {
        notes_en.innerHTML = "<p><strong>hal_parport &middot;> arisc.gpio:</strong> "
            + "Not enough GPIO pins for conversation, you need " + (total_cnt - pins.length) + " pins more. "
            + "Your HAL code totally uses "+total_cnt+" LPT pins. "
            + "But a mini PC has only "+pins.length+" pins.</p>";
    }
    else if ( !total_cnt )
    {
        notes_en.innerHTML = "<p><strong>hal_parport &middot;> arisc.gpio:</strong> "
            + "There are no LPT pins inside this HAL code.</p>";
    }
    else
    {
        var p = 0, reg = 0;

        // replace pins
        for ( i = out_uniq.length; i--; p++ )
        {
            reg = new RegExp(out_uniq[i].replace(/([\.\-])/g, '\$1'), "g");
            s = s.replace(reg, 'arisc.gpio.' + (pins[p].toString().length < 2 ? '0'+pins[p] : pins[p]) + '-out');
        }
        for ( i = in_uniq.length; i--; p++ )
        {
            reg = new RegExp(in_uniq[i].replace(/([\.\-])/g, '\$1'), "g");
            s = s.replace(reg, 'arisc.gpio.' + (pins[p].toString().length < 2 ? '0'+pins[p] : pins[p]) + '-in');
        }

        // replace "loadrt hal_parport" string
        s = s.replace
        (
            /loadrt[\ \t]+hal_parport[^\r\n]*([\r\n]|$)*/g,
            'loadrt arisc_gpio'
                + (out_uniq.length ? ' out='+pins.slice(0, out_uniq.length).join(',') : '')
                + (in_uniq.length ? ' in='+pins.slice(out_uniq.length, total_cnt).join(',') : '')
                + "$1"
        );

        // replace others
        s = s.replace(/parport\.[0-9]+\./g, 'arisc.gpio.');

        // delete lines with reset function usage
        s = s.replace(/[^\r\n]+arisc_gpio\.reset[^\r\n]+(\r\n|\n|\r)/g, '');
        s = s.replace(/[^\r\n]+out\-reset[^\r\n]+(\r\n|\n|\r)/g, '');

        // invert output pins
        var inv_all = s.match(/arisc_gpio\.\w+\-out\-invert\s+1/g);
        if ( inv_all == null || typeof(inv_all) != "object" || typeof(inv_all.length) != "number" ) inv_all = [];
        var inv_uniq = [];
        for ( i = inv_all.length; i--; )
        {
            if ( !inv_uniq.includes(inv_all[i]) ) inv_uniq.push(inv_all[i]);
        }
        s = s.replace(/[^\r\n]+out\-invert[^\r\n]+(\r\n|\n|\r)/g, '');
        if ( inv_uniq.length > 0 )
        {
            for ( i = inv_uniq.length; i--; )
            {
                p = inv_uniq[i].match(/P\w[0-9]+/)[0];
                reg = new RegExp("(arisc.gpio\."+p+"\-out)", "g");
                s = s.replace(reg, "$1-not");
            }
        }

        // update output
        out.innerHTML = s;

        gpio_done = 1;

        // show success message
        notes_en.innerHTML = "<p><strong>hal_parport &middot;> arisc.gpio:</strong> OK.</p>";
    }

    if ( src.innerText.match(/loadrt\sstepgen/) )
    {
        // remove unused stepgen lines
        s = s.replace(/[^\r\n]+stepgen\.[0-9]+\.(steplen|stepspace|dirhold|dirsetup|maxaccel|maxvel|dirdelay|rawcounts|up|down|phase\-)[^\r\n]+(\r\n|\n|\r)/g, '');
        s = s.replace(/[^\r\n]+stepgen\.make\-pulses[^\r\n]+(\r\n|\n|\r)/g, '');

        // replace stepgen.X.step/dir pins
        var pin_net = s.match(/[^\r\n]*stepgen\.[0-9]+\.(step|dir)[^\r\n]*/g);
        if ( pin_net != null )
        {
            var net = {};
            for ( i = pin_net.length; i--; )
            {
                net.pin_type = pin_net[i].match(/stepgen\.[0-9]+\.step/) ? "step" : "dir";
                net.sg_ch = pin_net[i].replace(/[^\r\n]*stepgen\.([0-9]+)\.[^\r\n]*/g, "$1");
                if ( pin_net[i].match("arisc_gpio.P") )
                {
                    net.pin_str = pin_net[i].match(/P\w[0-9]+\-out(\-not)?/)[0];
                }
                else
                {
                    net.name = pin_net[i].replace(/stepgen\.[0-9]+\.(step|dir)/g, "");
                    net.name = net.name.replace(/([^\w])net([^\w])/g, "$1$2");
                    net.name = net.name.match(/([^\w])([\w\-]+)([^\w])/)[2];
                    reg = new RegExp("[^\r\n]*"+net.name+"[^\r\n]+arisc_gpio.P[^\r\n]+", "g");
                    net.pin_str = s.match(reg)[0];
                    net.pin_str = net.pin_str.match(/P\w[0-9]+\-out(\-not)?/)[0];
                }
                net.pin_port = net.pin_str.replace(/P(\w)[^\r\n]*/g, "$1").charCodeAt(0) - 65;
                net.pin_num = net.pin_str.replace(/P\w([0-9]+)[^\r\n]*/g, "$1");
                net.pin_inv = net.pin_str.match("not") ? 1 : 0;

                s = s.replace(pin_net[i],
                      "setp stepgen." + net.sg_ch + "." + net.pin_type + "-port " + net.pin_port + "\n"
                    + "setp stepgen." + net.sg_ch + "." + net.pin_type + "-pin " + net.pin_num + "\n"
                    + "setp stepgen." + net.sg_ch + "." + net.pin_type + "-invert " + net.pin_inv
                );
            }
        }

        // rename stepgen usage lines
        s = s.replace(/stepgen\./g, 'arisc.pwm.');

        // replace "loadrt stepgen" string
        var loadrt = s.match(/loadrt[\ \t]+stepgen[^\r\n]*/);
        if ( loadrt != null )
        {
            loadrt = loadrt[0];
            loadrt = loadrt.replace("stepgen", "arisc.pwm");
            var step_type = loadrt.match(/step_type=([^ \t]+)/)[1];
            var ch_cnt = step_type.match(/[0-9]+/g).length;
            var ch_type = (new Array(ch_cnt)).fill("p",0,ch_cnt);
            if ( loadrt.match(/ctrl_type=/) )
            {
                var ctrl_type = loadrt.match(/ctrl_type=([^ \t]+)/)[1];
                var ch_type_orig = ctrl_type.match(/(p|v)/g);
                for ( i = 0; i < ch_type_orig.length; i++ ) ch_type[i] = ch_type_orig[i];
            }
            loadrt = loadrt.replace(/(user_)?(step|ctrl)_type=[^ \t]+/g, "");
            loadrt += " ctrl_type=" + ch_type.join(",");
            loadrt = loadrt.replace(/[ \t]+/g, " ");
            s = s.replace(/loadrt[\ \t]+stepgen[^\r\n]*/g, loadrt);
        }

        // update output
        out.innerHTML = s;

        stepgen_done = 1;

        // show success message
        notes_en.innerHTML += "<p><strong>stepgen &middot;> arisc.pwm:</strong> OK.</p>";
    }
    else
    {
        notes_en.innerHTML += "<p><strong>stepgen &middot;> arisc.pwm:</strong> "
            + "There are no stepgen lines inside this HAL code.</p>";
    }

    if ( gpio_done || stepgen_done )
    {
        // scroll to the top
        src.scrollTo(0,0);
        out.scrollTo(0,0);

        // highlight code
        if ( hl_code != undefined && typeof(hl_code) == "function" ) hl_code();
    }
}

var btn = document.querySelector("#conv_btn_2");
btn.addEventListener("click", lpt2arisc);
