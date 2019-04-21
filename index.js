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
function execControlled(exec, control, initialValue) {
    const subject = new rxjs_1.BehaviorSubject(initialValue);
    const doExec = () => execAndForward(exec, subject, () => control(doExec));
    doExec();
    return subject;
}
exports.execControlled = execControlled;
