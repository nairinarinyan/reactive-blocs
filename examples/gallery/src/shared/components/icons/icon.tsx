import React from 'react';

interface Props {
    icon: string;
}

export const Icon = (props: Props) => (
    <svg width="100%" height="100%">
        <use xlinkHref={`#${props.icon}`}></use>
    </svg>
);