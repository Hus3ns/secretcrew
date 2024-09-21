// src/components/Host/HostList.js

import React from 'react';
import { useHost } from '../../contexts/HostContext';
import HostItem from './HostItem';

const HostList = () => {
  const { hosts } = useHost();

  return (
    <div>
      <h2>Host List</h2>
      <ul>
        {hosts.map(host => (
          <HostItem key={host.id} host={host} />
        ))}
      </ul>
    </div>
  );
};

export default HostList;
