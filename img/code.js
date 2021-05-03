var hl =
[
    {
        name: "hal",        // css class name
        comment:
        {
            line: ["#"],
            multi: []       // example [ ['/\\*','\\*/'] ]
        },
        number: '(^|[^\\w])(-?[0-9]+)(\\.[0-9]+)?',
        k0: [
            'iocontrol','parport','hal_parport',
            'arisc','arisc\\.gpio','arisc\\.pwm','arisc\\.encoder',
            'tp','motion','axis','classicladder','gladevcp','threads','and2','not','or2','xor2','debounce','edge',
            'flipflop','oneshot','logic','lut5','match8','select8','abs','blend','comp','constant','sum2',
            'counter','updown','ddt','deadzone','hypot','mult2','mux16','mux2','mux4','mux8','near','offset',
            'integ','invert','wcomp','weighted_sum','biquad','lowpass','limit1','limit2','limit3','maj3',
            'scale','conv_bit_s32','conv_bit_u32','conv_float_s32','conv_float_u32','conv_s32_bit','conv_s32_float',
            'conv_s32_u32','conv_u32_bit','conv_u32_float','conv_u32_s32','hm2_7i43','hm2_pci','hostmot2',
            'mesa_7i65','pluto_servo','pluto_step','thc','serport','kins','gantrykins','genhexkins','genserkins',
            'maxkins','tripodkins','trivkins','pumakins','rotatekins','scarakins','at_pid','pid','pwmgen','encoder',
            'stepgen','bldc_hall3','clarke2','clarke3','clarkeinv','charge_pump','encoder_ratio','estop_latch',
            'feedcomp','gearchange','ilowpass','joyhandle','knob2float','minmax','sample_hold','sampler','siggen',
            'sim_encoder','sphereprobe','steptest','streamer','supply','threadtest','time','timedelay','timedelta',
            'toggle2nist','toggle','tristate_bit','tristate_float','watchdog','joint'
        ],
        k1: ['loadrt','loadusr','waitusr','unload','lock','unlock','net','linkps','linksp',
             'unlinkp','newsig','delsig','setp','getp','type','sets','gets','stype',
             'addf','delf','show','list','save','status','start','stop','source','echo','unecho','quit','exit'],
        s0: ['<=','=>','=&gt;','&lt;='],
        s1: ['P\\w[0-9]+']
    }
];



function hl_code()
{
    if ( typeof(hl) == "object" && typeof(hl.length) == "number" && hl.length > 0 )
    {
    //    console.log("hl = enable");

        for ( var c = hl.length; c--; )
        {
            var nodes = document.querySelectorAll("code." + hl[c].name);

            if ( typeof(nodes) != "object" ||
                typeof(nodes.length) != "number" ||
                nodes.length <= 0 ) continue;

    //        console.log("nodes = " + nodes.length);

            for ( var n = nodes.length; n--; )
            {
                var source = nodes[n].innerText;

                // numbers
                reg = new RegExp(hl[c].number, "g");
                source = source.replace(reg, '$1<span class="n">$2$3</span>');

                // keywords 0
                for ( var k = hl[c].k0.length, reg = 0; k--; )
                {
                    reg = new RegExp('(^|\\s)(' + hl[c].k0[k] + ')([^\\w]|$)', "g");
                    source = source.replace(reg, '$1<span class="k0">$2</span>$3');
                }

                // keywords 1
                for ( var k = hl[c].k1.length, reg = 0; k--; )
                {
                    reg = new RegExp('(^|[^\\w])(' + hl[c].k1[k] + ')([^\\w]|$)', "g");
                    source = source.replace(reg, '$1<span class="k1">$2</span>$3');
                }

                // special 0
                for ( var k = hl[c].s0.length, reg = 0; k--; )
                {
                    reg = new RegExp('(' + hl[c].s0[k] + ')', "g");
                    source = source.replace(reg, '<span class="s0">$1</span>');
                }

                // special 1
                for ( var k = hl[c].s1.length, reg = 0; k--; )
                {
                    reg = new RegExp('(' + hl[c].s1[k] + ')', "g");
                    source = source.replace(reg, '<span class="s1">$1</span>');
                }

                // line comments
                for ( var k = hl[c].comment.line.length, reg = 0; k--; )
                {
                    reg = new RegExp("(" + hl[c].comment.line[k] + "[^\r\n]*)([\r\n]|$)", "g");
                    source = source.replace(reg, '<span class="comment">$1</span>$2');
                }

                // multi-line comments
                for ( var k = hl[c].comment.multi.length, reg = 0; k--; )
                {
                    reg = new RegExp("(" + hl[c].comment.multi[k][0] + ")", "g");
                    source = source.replace(reg, '<span class="comment">$1');
                    reg = new RegExp("(" + hl[c].comment.multi[k][1] + ")", "g");
                    source = source.replace(reg, '$1</span>');
                }

                nodes[n].innerHTML = source;
            }
        }
    }
}

hl_code();
