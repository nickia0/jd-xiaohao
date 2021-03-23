## v2版脚本已不再维护

## 更新日志

- 2020-11-15：为保持跨平台兼容性，把`Docker`的`shell`也更换为`bash`，Docker用户需要删除原来的镜像重新部署方可正常使用。
    ```shell
    docker stop jd                # 停止名为jd的容器
    docker rm jd                  # 删除名为jd的容器
    docker rmi evinedeng/jd-base  # 删除名为evinedeng/jd-base的镜像
    ```
    无需重新配置，直接按原来的`docker run`命令重新部署即可恢复原有内容。

## 脚本可以干什么

总有人不明白本脚本到底在干什么，那就大概说明一下吧：

1. git_pull.sh 这是最重要的脚本，用来在每小时自动更新lxk0301大佬的js脚本，不要再问为什么不切换gitee了，github比gitee更新；自动更新我的shell脚本；检测js脚本是否有增加，如果有，自动在你的定时任务中也增加（AutoAddCron=true时）；检测是否有短期任务过期，如果有，就自动在你的定时任务中删除（AutoDelCron=true时）；按照你设置的参数去设置。
2. rm_log.sh 这个用来删除旧日志。
3. first_run.sh 这个是物理机用来一键克隆的脚本，只需要在第一次运行，或者是重新部署时运行。
4. jd.sh.sample 这个是样例，当有新的任务时，自动把它复制一份，这个文件自动识别和它同名的js文件并运行js脚本。
5. git_pull_function.sh是git_pull.sh背后的脚本，你不用管它。
6. 所有以`.sample`结尾的文件，均不需要你编辑。

## 部署环境

请先确认你的平台属于这几种：linux/amd64, linux/arm64, linux/ppc64le, linux/s390x, linux/arm/v7, linux/arm/v6，如不属于则无法使用本方法。

安装好docker([中文教程](https://mirrors.bfsu.edu.cn/help/docker-ce/))，然后在ssh工具中创建容器：

```shell
docker run -dit \
  -v /Host主机上的目录/:/root `#冒号左边请更改为你docker所在主机上的原始路径` \
  --name jd \
  --hostname jd \
  --restart always \
  --network host `#如果是旁路由OpenWrt的Docker，建议添加上network` \
  evinedeng/jd-base:latest
```

*注1：只有这里是多行一起复制粘贴的，下面其他的地方均是一行一行复制粘贴。*

*注2：对`-v`这个参数稍微解释一下，冒号前面是主机上的真实路径，冒号后面是虚拟路径，也就是在容器内部看到的路径，这个参数就是把冒号左边的真实路径映射为容器内冒号右边的虚拟路径。*

*注3：如需多账号并发，请配置多个容器。*

## 如何自动更新Docker容器

安装`containrrr/watchtower`可以自动更新容器，它也是一个容器，但这个容器可以监视你安装的所有容器的原始镜像的更新情况，如有更新，它将使用你原来的配置自动重新部署容器。部署`containrrr/watchtower`最简单的方式如下：

```shell
docker run -d \
    --name watchtower \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower
```
你也可以访问 https://containrrr.dev/watchtower/ 获取更详细的部署说明，包括如何避开某些容器不让它自动更新，如何发更新容器后发送通知，设置检测时间等等。

## 克隆脚本

1. 检查容器安装日志

    ```shell
    docker logs -f jd
    ```

    *注1：检查日志输出是否正常，如果是首次运行，那么最后一条输出将出现 `脚本执行成功，请按照 Readme 教程继续配置...` 在出现此消息后可按`CTRL + C`切出来。*

    *注2：如没有成功，请根据错误提示进行操作。如果啥中文提示都没有，那么是你网络不好，无法连接Github，请想办法改善。*
    
2. 确保出现上述成功的消息后，进入容器环境：

    **本Readme中所有docker部分的命令均需要在进入容器后运行！！**

    **本Readme中所有docker部分的命令均需要在进入容器后运行！！**

    **本Readme中所有docker部分的命令均需要在进入容器后运行！！**

    ```shell
    docker exec -it jd /bin/bash
    ```
    
    成功进入后光标处应变为下面这样（其中`~`代表家目录，对`root`用户而言，就是`/root`），如果没有，那么请检查容器安装日志。
    
    ```shell
    root@jd:~ $
    ```
    
3. docker容器创建后会在容器中的`/root`文件夹下自动克隆好跑JD小游戏的js脚本和shell脚本，产生以下三个文件夹：

    - `log`: 记录所有日志的文件夹，其中跑js脚本的日志会建立对应名称的子文件夹，并且js脚本日志会以`年-月-日-时-分-秒`的格式命名。

    - `scripts`: 从 [lxk0301/jd_scripts](https://github.com/LXK9301/jd_scripts) 克隆的js脚本。

    - `shell`: 从 [EvineDeng/jd-base](https://github.com/EvineDeng/jd-base) 克隆的shell脚本。

## 修改信息

1. 复制`git_pull.sh.sample`为`git_pull.sh`:

    ```shell
    cd /root/shell
    cp git_pull.sh.sample git_pull.sh
    ```

2. 编辑`git_pull.sh`：

    ```shell
    nano git_pull.sh   # Ctrl+O 回车保存，Ctrl+X 回车退出
    ```
    
    建议Windows用户使用WinSCP工具，以SFTP协议连接机器，前往部署容器时运行的 `-v /Host主机上的目录/:/root` 这个命令中冒号左边的路径下面去找，如何使用WinSCP请自行百度。可定义内容清单：[参数清单](参数清单)

    - *注1：如果在windows下编辑`git_pull.sh`，请使用WinSCP自带编辑器，或 notepad++、VS Code、Sublime Text 3等软件，请不要使用记事本。*

    - *注2：如何修改请仔细阅读文件中的注释部分。*

    - *注3：如果在WinSCP中看不见文件或看见了但不是最新的文件，请点击鼠标右键-刷新来刷新文件清单。*

## 初始化

**在首次编辑好`git_pull.sh`这个文件后，请务必手动运行一次`git_pull.sh`，不仅是为检查错误，也是为了运行一次`npm install`用以安装js指定的依赖。**

**在其他任何时候，只要你编辑过`git_pull.sh`，又想马上看到效果，请必须手动运行一次`git_pull.sh`！**

1. 完成所有信息修改以后，先检查一下git_pull.sh能否正常运行。

    ```shell
    cd /root/shell
    chmod +x *.sh
    bash git_pull.sh
    ```

    **注1：`.sh`脚本如果没有可执行权限，虽然手动执行可以运行，但定时任务将无法正常运行。**

    **注2：首次运行的日志很重要，如果过程中有任何错误，请参考错误提示来解决问题。主要包括两类问题：一是无法访问github，请想办法改善网络；二是`git_pull.sh`会运行`npm install`，用来安装js指定的依赖，如果你网络不好，日志中会有提示，请注意观察。**

    **针对首次运行`git_pull.sh`**，出现类似以下字样才表示`npm install`运行成功：
    ```
    audited 205 packages in 3.784s

    11 packages are looking for funding
    run `npm fund` for details

    found 0 vulnerabilities
    ```

    如果`npm install`失败，请尝试手动运行，可按如下操作，如果失败，可运行多次：

    ```shell
    cd /root/scripts
    npm install || npm install --registry=https://registry.npm.taobao.org
    ```

2. 看看js脚本的信息替换是否正常。

    ```shell
    cd /root/scripts
    git diff          # 请使用上下左右键、Page Down、Page Up进行浏览，按q退出
    ```

3. 然后你可以手动运行一次任何一个以`jd_`开头并以`.sh`结尾的脚本（有些脚本会运行很长时间，sh本身不输入任何内容在屏幕上，而把日志全部记录在日志文件中）。

    ```shell
    cd /root/shell
    bash jd_unsubscribe.sh
    ```

    去容器中`/root/log/jd_unsubscribe`文件夹下查看日志，查看结果是否正常，如不正常，请从头检查。

## 定时任务

1. 复制一份`crontab.list`到`/root`目录下。

    ```shell
    cp /root/shell/crontab.list.sample /root/crontab.list
    ```

2. 按修改`git_pull.sh`的方法修改`crontab.list`。

3. 添加定时任务。

    ```shell
    crontab /root/crontab.list
    ```

**说明：**

- `crontab.list`这个文件必须存放在`/root`下，其他地方会影响后续脚本运行。

- `/root/log/crond.log`可查看定时任务的运行情况。

- 第一条定时任务`/root/shell/git_pull.sh`会自动更新js脚本和shell脚本，并完成Cookie、互助码等信息修改，这个任务本身的日志会存在`/root/log/git_pull.log`中。更新过程不会覆盖掉你已经修改好的`git_pull.sh`文件。

- 第二条定时任务`/root/shell/rm_log.sh`用来自动删除旧的js脚本日志，如果你未按下一节`自动删除旧日志`中操作的话，这条定时任务不会生效。

- 当`git_pull.sh`中的`AutoAddCron`设置为`false`时（不自动增加新的定时任务），如何手动添加新增js脚本的定时任务：

    1. 检查有没有新增脚本：
        ```shell
        cat /root/log/js-add.list
        ```
    2. 如果上一条命令不为空说明有新的定时任务待添加，把内容记下来，比如有个新增的任务叫为`jd_test`，那么就运行以下命令:
        ```shell
        cp /root/shell/jd.sh.sample /root/shell/jd_test.sh
        ```
    3. 再次提醒不要忘记赋予可执行权限：
        ```shell
        chmod +x /root/shell/jd_test.sh
        ```
    4. 编辑crontab.list，并添加进crontab
        ```shell
        nano /root/crontab.list
        crontab /root/crontab.list
        ```

## 自动删除旧日志

单个日志虽然小，但如果长期运行的话，日志也会占用大量空间，如需要自动删除，请按以下流程操作：

1. 复制一份rm_log.sh，并赋予可执行权限：

    ```shell
    cd /root/shell
    cp rm_log.sh.sample rm_log.sh
    chmod +x rm_log.sh
    ```

2. 该脚本在运行时默认删除`7天`以前的日志，如果需要设置为其他天数，请修改脚本中的`HowManyDays`。

3. 按`定时任务`部分的说明修改定时任务。

## 退出容器

如果是Docker安装的，请在配置完成以后退出容器环境：

```
exit
```

## 补充说明

- 其实`shell`目录下所有以`jd_`开头以`.sh`结尾的文件内容全都一样，全都是从`jd.sh.sample`复制来的，它们是依靠它们自身的文件名来找到所对应的`scripts`目录下的js文件并且执行的。所以，有新的任务时，只要你把`jd.sh.sample`复制一份和新增的`.js`脚本名称一样，赋予可执行权限，再增加定时任务就可以了。

- 如果想要重新调整定时任务运行时间，请不要直接使用`crontab -e`命令修改，而是编辑`/root/crontab.list`这个文件，然后使用`crontab /root/crontab.list`命令覆盖。这样的好处只要你没有删除容器映射目录`/root`在Host主机上的原始文件夹，重建容器时任务就不丢失，并且，如果重建容器，容器还将在启动时自动从`/root/crontab.list`中恢复定时任务。

- 如果shell脚本有更新，需要你手动复制一份`git_pull.sh.sample`，并重新修改必须的信息，然后命名为`git_pull.sh`，流程如下：
    ```shell
    cd /root/shell
    cp git_pull.sh.sample git_pull_2.sh

    # 然后修改git_pull_2.sh，也可使用其他可视化工具修改
    nano git_pull_2.sh

    # 修改好后，替换旧的git_pull.sh
    mv git_pull_2.sh git_pull.sh

    # 不要忘记赋予修改后的.sh脚本可执行权限
    chmod +x git_pull.sh
    ```

- 如有帮助到你，请点亮 star 。
