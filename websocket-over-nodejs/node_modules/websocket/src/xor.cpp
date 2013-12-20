/*!
 * Buffer xor module
 * Copyright (c) Agora S.A.
 * Licensed under the MIT License.
 * Version: 1.0
 */

#include <v8.h>
#include <node_buffer.h>
#include <cstring>

using namespace node;
using namespace v8;

namespace {
  #define XOR_BUFFER_THROW_EXCEPTION(name, msg) { \
    static Persistent<String> name = Persistent<String>::New(String::New(msg)); \
    return ThrowException(Exception::TypeError(name)); }

  static Handle<Value> xorBuffer(const Arguments &args) {
    if (args.Length() < 2) {
      XOR_BUFFER_THROW_EXCEPTION(illegalArgumentCountException, "Expected 2 arguments")
    }

    if (!Buffer::HasInstance(args[0])) {
      XOR_BUFFER_THROW_EXCEPTION(illegalFirstArgumentException, "First argument must be a Buffer.")
    }
    Handle<Object> payload = args[0]->ToObject();

    if (!Buffer::HasInstance(args[1])) {
      XOR_BUFFER_THROW_EXCEPTION(illegalArgumentException, "Second argument must be a Buffer.")
    }
    Handle<Object> mask = args[1]->ToObject();
    size_t maskSize = Buffer::Length(mask);

    if (maskSize != 4) {
      XOR_BUFFER_THROW_EXCEPTION(illegalStringArgumentException, "Second argument must be a 4 byte Buffer.")
    }

    size_t maskOffset = 0;
    if (args.Length() == 3) {
      if (!args[2]->IsUint32()) {
        XOR_BUFFER_THROW_EXCEPTION(illegalThirdArgumentException, "Third argument must be an unsigned number.")
      }
      maskOffset = args[2]->ToUint32()->Uint32Value();
    }

    if (maskOffset > 3) {
      XOR_BUFFER_THROW_EXCEPTION(illegalStringArgumentException, "Third argument must be less than 4.")
    }

    size_t payloadLength = Buffer::Length(payload);
    uint8_t* payloadData = (uint8_t*) Buffer::Data(payload);
    uint8_t* maskData = (uint8_t*) Buffer::Data(mask);

    uint8_t rotatedMask[4];
    memcpy(rotatedMask, maskData + maskOffset, 4 - maskOffset);
    if (maskOffset > 0) {
      memcpy(rotatedMask + 4 - maskOffset, maskData, maskOffset);
    }

    uint32_t* pos32 = (uint32_t*) payloadData;
    uint32_t* end32 = pos32 + (payloadLength >> 2);
    uint32_t* mask32 = (uint32_t*) rotatedMask;

    while (pos32 < end32) {
      *(pos32++) ^= *mask32;
    }

    uint8_t* pos8 = (uint8_t*)pos32;
    uint8_t* end8 = payloadData + payloadLength;
    uint8_t* mask8 = rotatedMask;

    while (pos8 < end8) {
      *(pos8++) ^= *(mask8++);
    }

    return Integer::NewFromUnsigned((mask8 - rotatedMask + maskOffset) & 3);
  }

  void RegisterModule(Handle<Object> target) {
    NODE_SET_METHOD(target, "xor", xorBuffer);
  }
}

NODE_MODULE(xor, RegisterModule);
