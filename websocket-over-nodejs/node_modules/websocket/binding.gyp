{
  'targets': [
    {
      'target_name': 'validation',
      'cflags': [ '-O3' ],
      'sources': [ 'src/validation.cc' ]
    },
    {
      'target_name': 'xor',
      'cflags': [ '-O3' ],
      'sources': [ 'src/xor.cpp' ]
    }
  ]
}
