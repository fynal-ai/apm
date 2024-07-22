<script lang="ts">
    import NoteCard from './NoteCard.svelte';
    import PageMessage from '$lib/PageMessage.svelte';
    const cards = [
        {   
            key: 'flexRadioDefault',
            programmeq: '方式一',
            title: 'CPU环境',
            ischecked: true,
            remainingCredits: '长期有效',
            content: [
                '8核 32GB',
                '预装 Baystone Library',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        },
        {   
            key: 'flexRadioDefault',
            programmeq: '方式二',
            title: 'GPU环境',
            ischecked: false,
            remainingCredits: '剩余额度: 6666小时32分',
            content: [
                '8核 32GB 显存24G',
                '预装 Baystone Library',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        }
    ];
    const img_path = 'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aimodel/computer.png';
    const img_path_active = 'https://baystone-1321031556.cos.ap-guangzhou.myqcloud.com/aimodel/computer2.png';
    const my_instance = [
        {   
            is_checked: true,
            name: 'yun_xadwdad_1',
            path: 'home/yun_xadwdad',
        },
        {   
            is_checked: false,
            name: 'yun_xadwdad_2',
            path: 'home/yun_xadwdad',
        },
        {
            is_checked: false,
            name: 'yun_xadwdad_3',
            path: 'home/yun_xadwdad',
        },
        {
            is_checked: false,
            name: 'yun_xadwdad_4',
            path: 'home/yun_xadwdad',
        }
    ]
    const by_cards = [
        {   
            key: 'flexRadioDefault2',
            programmeq: '套餐一',
            title: '基础型(Basic)',
            ischecked: true,
            remainingCredits: '每个新用户可免费8小时',
            content: [
                '8核 内存24GB GPU(LS40S * 1 48G)',
                '预装 Baystone Library',
                '适合AI初学者,进行基本的机器学习模型和小规模的数据分析',
                '包机 12块/小时',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        },
        {   
            key: 'flexRadioDefault2',
            programmeq: '套餐二',
            title: '标准型(Standard)',
            ischecked: false,
            remainingCredits: '不免费试用',
            content: [
                '8核 内存32GB GPU(LS40S * 1 48G)',
                '预装 Baystone Library',
                '适合中等规模的AI项目,进行机器学习',
                '包机 13块/小时',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        },
        {   
            key: 'flexRadioDefault2',
            programmeq: '套餐三',
            title: '高级型(Advanced)',
            ischecked: false,
            remainingCredits: '不免费试用',
            content: [
                '8核 内存64GB GPU(LS40S * 2 96G)',
                '预装 Baystone Library',
                '适合大规模的AI项目,进行深度学习和大数据分析和模型训练',
                '包机 21块/小时',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        },
        {   
            key: 'flexRadioDefault2',
            programmeq: '套餐四',
            title: '专业型(Professional)',
            ischecked: false,
            remainingCredits: '不免费试用',
            content: [
                '8核 内存128GB GPU(LS40S * 2 96G)',
                '预装 Baystone Library',
                '适合专业的AI研究,进行深度学习模型训练,大规模模拟和高性能计算任务.',
                '包机 25块/小时',
                '预装镜像'
            ],
            options: [
                'ubuntu22.04-py310-torch2.1.2-tf2.14.0-1.11.0',
                'ubuntu20.04-py38-torch2.0.1-tf2.13.0-1.9.5',
                'ubuntu20.04-py38-torch1.11.0-tf1.15.5-1.8.1',
                'ubuntu20.04-py37-torch1.11.0-tf1.15.5-1.6.1'
            ]
        }
    ]
    function open_url() {
        window.open('http://59.36.211.227:8888/lab');
    }
</script>
<ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home" type="button" role="tab" aria-controls="pills-home" aria-selected="true">免费试用</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="pills-profile-tab" data-bs-toggle="pill" data-bs-target="#pills-profile" type="button" role="tab" aria-controls="pills-profile" aria-selected="false">个人实例</button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="pills-by-tab" data-bs-toggle="pill" data-bs-target="#pills-by" type="button" role="tab" aria-controls="pills-by" aria-selected="false">购买实例</button>
    </li>
</ul>
<div class="tab-content" id="pills-tabContent">
    <div class="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab" tabindex="0">
        <PageMessage pageMessage="为算法开发者量身打造的云端深度学习开发环境，内置JupyterLab及Terminal，无需任何运维配置即可编写、调试及运行Python代码。"/>
        <div class="row card-row">
            {#each cards as card}
                <NoteCard {card} />
            {/each}
        </div>
        <button class="btn btn-primary btn-sm" type="button" on:click={open_url}>环境启动</button>
    </div>
    <div class="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab" tabindex="0">
        <PageMessage pageMessage="以下都是你的个人实例，请选择合适的使用。"/>
        <div class="row card-row">
            {#each my_instance as instance}
                <div class="col col-auto card-box" on:click={
                    () => {
                        my_instance.forEach((item) => {
                            item.is_checked = false;
                        });
                        instance.is_checked = true;
                    }
                
                }>
                    <img src={instance.is_checked? img_path_active:img_path} class="img-thumbnail" class:active={instance.is_checked}/>
                    <div class="card-body">
                        <span class="card-title">{instance.name}</span>
                    </div>
                </div>
            {/each}
        </div>
        <button class="btn btn-primary btn-sm" type="button" on:click={open_url}>环境启动</button>
    </div>
    <div class="tab-pane fade" id="pills-by" role="tabpanel" aria-labelledby="pills-by-tab" tabindex="0">
        <PageMessage pageMessage="选择你需要的套餐，购买之后你将在个人实例中看到它。"/>
        <div class="row card-row">
            {#each by_cards as card}
                <NoteCard {card} />
            {/each}
        </div>
        <div class="input-group input-group-sm mb-3">
            <span class="input-group-text">按时间购买:</span>
            <input type="text" class="form-control">
            <button class="btn btn-secondary" type="button" on:click={()=>{}}>+</button>
            <button class="btn btn-secondary" type="button" on:click={()=>{}}>-</button>
            <span class="input-group-text">共计</span>
            <input type="text" class="form-control" disabled>
            <span class="input-group-text">元</span>
        </div>
         <button class="btn btn-primary btn-sm" type="button" on:click={()=>{}}>购买</button>
    </div>
</div>
<style scoped>
    .card-row {
        margin: 1rem 0;
    }
    .img-thumbnail{
        object-fit: cover;
        width: 200px;
        height: 200px;
        border: none;
        padding: 1rem;
    }
    .card-box{
        cursor: pointer;
    }
    .card-box .img-thumbnail:hover{
        box-shadow: 0 0 10px 0 rgba(0,0,0,0.1);
    }
    .img-thumbnail.active{
        border: 1px solid #b982ec;
    }
</style>