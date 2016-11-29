var zoomHandler = {
    scale: 1.0,
    up: function(e) {
        this.scale += .01;
        this.apply();
    },
    down: function(e) {
        this.scale -= .01;
        this.apply();
    },
    apply: function() {
        tempContext.scale(this.scale, this.scale);
        context.scale(this.scale, this.scale);
        drawHelper.redraw();
    },
    icons: {
        up: function(ctx) {
            var image = new Image();
            image.width = 32;
            image.height = 32;
            image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTJDBGvsAAADiklEQVRoQ+2ZLXMUQRCGT0RERCCQiJMRyEjEiYiIiBOIiIiIiIiIExHIq4qlKiI/AMEPiIhEREREIpAIBAKBQCAQiON9trphcnt787F7lZoqRNfex0x3v909/TE7WiwWo5qpauUx/H8ATx1+g3hgNBptiw5F16Ib0YPoq0g+bp5853f+Z932UMCLAUiJLdGRKfbTlEXhFGI9gNi/1QdMEQAJPRB9DJT9rc/3oguz8J6eL5pDpqeI71ie/1nHegf6SZ+npSCyAEjQWHQXCP+sz6ei5zkKsF50JmK/A4Hvbg6frCwk5hPRNxP4w6zZK5bFgzCcib4HfPdzQCR5wKzsbv+g789yhMTWwk90ayCQcxbb4/9HAZjy7uYrrJbKPHedeF8GIXWasn8tAAsbt/x5CsO+ayTzOPDEJMavE4CYjIOYv4oxGvJ/yZ0bCM7ceB3vdQA82xDz2WETKDEvAaf91AlC9y4bgDaR59lMtik6sAMA2Aki4KALRMsDWFvkReqixHpWwDwMijxgPM7NkOizMgpWAaC8Y32KTHGe7+sBA4AxvdgdrTLmKgAee0lprNO1/w5isQcMBBUbg95EAWBxEY0WqTOrPVhmPoQHDABtB/qgVysiHnlAC2i4QHtfGvt/K+RAHjAQNIDoddgyVPiDFtCvs7D48G4IAF0sel3HAHj8t5DmemSoEDIPeGS0zsFyCDE5gXQvV+FNnQEDwDyBXg8xD/gY2AwjHUrNxOjEaKrnxOilnmMjitDchPbKQgaAoagZT2MAmq5zTWpMGReX15A9vhjhYVoU6L3onRFdKIA7wRqAlm7LIZTiAVpqF0wP7woxGrqiv1xg7rPD88ke2MQZeBuE1qsg5GibT4wa63d5QL8nn4Hqs1D1daD6Slx3L2Q5t95u1ACE80D2KDlkL6TsUzQPsImcTkGalbYUlhbhUVyJtZdbP3igT9pEZl6Y2kZuzJ5qJuY8+k1g591pyq3EbYkX+npA+2k1ym4lzAu7YsCtBEwuS0CU7pG8NyYX+WsvfGM3c/ti4Ddzx6UK5eyTvNcmE7nRi96Uu1EfqnsdyBQQZnk3WNIFbxSAhRPZwBlTJ3ZSFEpdI34cWI/5YW+ng7w+CbIC2YFLp+I6YYYhZWOc8L1DNGxCwyR5IAAxljD6fx9a6nlD8wh1re/IlkDU+5ZyxbBf33vi1Ayz6XVZh3jTypTwrx7AH8HANnr8oqz7AAAAAElFTkSuQmCC';
            ctx.drawImage(image, 4, 4, 32, 32);
        },
        down: function(ctx) {
            var image = new Image();
            image.width = 32;
            image.height = 32;
            image.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjAuMTJDBGvsAAADdUlEQVRoQ+2Zr1IcQRDGTyAQiIiIiIiTiEhkxAkEAnEiAoGIQCAQJxCRVPEACB4AkQdAICMQCGREZERERERERERExOX7bXVXDXu7NzP7h6upylV17e5tT3d/3T09PbOT5XI5KZmKNh7H/wew6fQbJAKTyWRbdCi6Ft2KHkXfRYpxdeWZ/3kP3/ZQwDsDkBFboiMz7LcZi8EpBD+AGL/VB0wnAFJ6IPocGPtX9w+ic/Pwnq6vq0mmq4hnPM97+OB3oF90P+8KIguAFE1F94Hyr7o/Eb3MMQB+0amI8Q4Eubs5crKqkITPRD9M4S/zZq9clgzScCH6GcjdzwGRFAHzsof9k55f5CiJ8SJPdGcg0HMaG+PvowDMeA/zFV5LFZ7LJ9mXQUqdpIxfC8DSxj1/liKwL490HgeRmMXktQKQkGmQ81cxQUO+l94LA8Gcm66TvQ6AVxtyfrS0aTNOOlknSN37bAAaRJ1nMNVm0AmbGinp3Qky4KAVaP0F3hb5InWeqnAMPtlxZo7EnsYsWEkhMbK8430WmV51vi8oc6YvdkdN8poAeO4llbG+RsbGCwQrNg69jQLA4yIaLUpnVnsQM6Tre+wwe7BrJSOeREAMNFygfeiqcIxx2GN2Ha7M2fAPMdGvA2Cjk7ehsNDFYtd1DIDn/wrSMTybKjPIjJV5UE8hdk4g3UsV/hx82GN2PcYi4NvAajPSEMoLCVqI3hvNdZ0ZvdF1arQzJDDJZFNUbU9jAKqus3XVS9su1reU9DPfjIgwLQr0UXRjRBeKcy5iumMAUiJAS+2K6eHdILaGbugf81gdTPS5JfLJERh8DgjIqyC13gYpR9vsqVh5vy0C+j95DhRfhYpfB4pficvuhagA+pXbjRqAcD/w7FvJWm/G5ip7P8AgajrhWAy5oubKkn5O/bADe9J2ZBaFuQ3kxGxTe2Lmo58Etp6dppxK3OV6bgh+GU+r0e1UwqKwKwGcSiDkcgijUmVI3wfTi/61B76xk7l9CfCTueNUA/rwSd8704ne6EFvytmob6qJRGu32MdoH2ued4clHfBGAVg6UQ1cMOvE0P0+E9ZzftjT6cA7s6AqUB04dOq1TjDeSmX43SGaNk/WipzQS9lURP/vfX05X2hqK2SZ38galvkyv1I2bPbL+06cM3fG5E0qo2Ma0Fd28QD+AZqKxdXXwZ1FAAAAAElFTkSuQmCC';
            ctx.drawImage(image, 4, 4, 32, 32);
        }
    }
};
