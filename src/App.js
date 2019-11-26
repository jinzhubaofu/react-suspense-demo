
import React, { Component, useState, Suspense, useRef } from "react";



const createResource = (load, getCacheKey) => {

  const cache = new Map();

  return (...args) => {

    let cacheKey = getCacheKey(...args);
    let promise = null;
    let status;
    let result;

    // 没有缓存时，发起请求，把 promise 缓存起来
    if (!cache.has(cacheKey)) {
      status = 'pendding';
      promise = load(...args);
      promise.then(
        r => {
          status = 'resolved';
          result = r;
          cache.set(cacheKey, {
            status,
            result
          });
        },
        e => {
          status = 'error';
          result = e;
          cache.set(cacheKey, {
            status,
            result
          });
        }
      );
      cache.set(cacheKey, {
        promise,
        status,
      });
    } else {
      let cachedState = cache.get(cacheKey);
      status = cachedState.status;
      promise = cachedState.promise;
      result = cachedState.result;
    }

    return {
      read() {
        switch (status) {
          case 'pendding':
            throw promise;
          case 'error':
            throw result;
          case 'resolved':
            return result;
          default:
            throw new Error('');
        }
      }
    };

  };

};

const fetch = async (url) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        name: 'test',
        url
      });
    }, 5000);
  })
};

const loadData = createResource(
  (id) => {
    return fetch(`/foo/${id}`);
  },
  // cache
  (id) => {
    return id;
  }
);


const AsyncFoo = () => {
  const data = loadData(1).read();
  console.log('111', data);
  return <div>{data.name}</div>;
};

const Foo = ({id}) => {
  console.log('foo', id);
  return <div>foo</div>;
};

export default class App extends Component {

  render() {
    return (
      <div className="App">
        <Suspense fallback={<div>loading...</div>}>
          <Foo id="1" />
          <AsyncFoo />
          <Foo id="2" />
          <AsyncFoo />
          <Foo id="3" />
          <AsyncFoo />
          <Foo id="4" />
          <AsyncFoo />
          <Foo id="5" />
          <AsyncFoo />
        </Suspense>
      </div>
    );
  }
}

