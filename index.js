"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function execAndForward(exec, subject, cb) {
    exec().subscribe((val) => {
        subject.next(val);
        cb && cb();
    });
}
;
function execAlways(exec, initialValue) {
    const subject = new rxjs_1.BehaviorSubject(initialValue);
    return new rxjs_1.Observable(observer => {
        if (subject.getValue() === initialValue) {
            observer.next(initialValue);
        }
        execAndForward(exec, subject);
        subject.pipe(operators_1.distinctUntilChanged()).subscribe(val => val !== initialValue && observer.next(val));
    });
}
exports.execAlways = execAlways;
function execOnce(exec, initialValue) {
    const subject = new rxjs_1.BehaviorSubject(initialValue);
    execAndForward(exec, subject);
    return subject;
}
exports.execOnce = execOnce;
function execControlled(exec, initialValue, control) {
    const subject = new rxjs_1.BehaviorSubject(initialValue);
    const doExec = () => execAndForward(exec, subject, () => control(doExec));
    doExec();
    return subject;
}
exports.execControlled = execControlled;
// **********************************
let vl = 120;
const executor = () => {
    console.log('coputing\n');
    return rxjs_1.of(vl).pipe(operators_1.delay(100));
};
const value = execAlways(executor, 12);
console.log('first subbing');
value.subscribe(v => {
    console.log('first', v);
});
setTimeout(() => {
    console.log('second subbing');
    vl += 500;
    value.subscribe(v => {
        console.log('second', v);
    });
}, 300);
setTimeout(() => {
    console.log('third subbing');
    value.subscribe(v => {
        console.log('third', v);
    });
}, 400);
